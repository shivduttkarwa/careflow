<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Patient;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DailyReportController extends Controller
{
    /**
     * Records rendered in one care book. Printing every filtered record would
     * produce an unusable PDF, so the view says when the list was cut short.
     */
    private const BOOK_LIMIT = 120;

    private const FILTER_KEYS = ['patient', 'worker', 'home', 'from', 'to'];

    private const EXPORT_COLUMNS = [
        'Record ID', 'Home', 'Patient', 'Date', 'Day', 'Shift', 'Support worker', 'Status', 'Submitted at',
        'Shower taken', 'Bed bath', 'Physio completed', 'Personal care notes',
        'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Fluids (mL)', 'Fluid notes', 'Food notes',
        'Bowel opened', 'Bowel texture', 'Bowel notes', 'Urine observation', 'Urine notes',
        'Sleep from', 'Sleep to', 'Overnight observations', 'Overnight attendance',
        'Seizure events', 'Follow-up required', 'Handover notes',
    ];

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', DailyReport::class);
        $user = $request->user();

        $reports = $this->filteredReports($request, $user)
            ->with(['patient.home', 'user'])
            ->withCount('seizureEvents')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (DailyReport $report) => $this->summaryPayload($report));

        $patients = $this->accessiblePatients($user);

        return Inertia::render('reports/index', [
            'reports' => $reports,
            'patients' => $patients->map(fn (Patient $patient) => [
                'id' => $patient->id,
                'name' => $patient->display_name,
            ]),
            'homes' => $patients->pluck('home')->unique('id')->sortBy('name')->values()
                ->map(fn (Home $home) => ['id' => $home->id, 'name' => $home->name]),
            'workers' => $user->isManager()
                ? User::query()->where('role', 'support_worker')->orderBy('name')->get(['id', 'name'])
                : collect([['id' => $user->id, 'name' => $user->name]]),
            'filters' => $request->only(self::FILTER_KEYS),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', DailyReport::class);
        $user = $request->user();

        $reports = $this->filteredReports($request, $user)
            ->with(['patient.home', 'user'])
            ->withCount('seizureEvents');

        $this->auditExport($request, 'exported-csv');

        return response()->streamDownload(function () use ($reports): void {
            $handle = fopen('php://output', 'wb');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\u{FEFF}");
            fputcsv($handle, self::EXPORT_COLUMNS);

            $reports->chunk(200, function ($chunk) use ($handle): void {
                foreach ($chunk as $report) {
                    fputcsv($handle, $this->exportRow($report));
                }
            });

            fclose($handle);
        }, 'careflow-daily-records-'.now()->format('Y-m-d-Hi').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function book(Request $request): View
    {
        Gate::authorize('viewAny', DailyReport::class);
        $user = $request->user();

        $query = $this->filteredReports($request, $user);
        $total = (clone $query)->count();

        $reports = $query
            ->with(['patient.home', 'user', 'shift', 'seizureEvents'])
            ->reorder('report_date')
            ->orderBy('id')
            ->limit(self::BOOK_LIMIT)
            ->get();

        $this->auditExport($request, 'exported-book');

        return view('reports.book', [
            'reports' => $reports,
            'total' => $total,
            'truncated' => $total > $reports->count(),
            'range' => $this->rangeLabel($reports),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $patients = $this->accessiblePatients($user);

        if ($patients->isEmpty()) {
            if ($request->integer('patient')) {
                $requestedPatient = Patient::findOrFail($request->integer('patient'));
                Gate::authorize('create', [DailyReport::class, $requestedPatient]);
            }

            return redirect()
                ->route('patients.create')
                ->with('error', 'Add a patient before starting a daily note.');
        }

        $patient = $patients->firstWhere('id', $request->integer('patient')) ?? $patients->first();
        Gate::authorize('create', [DailyReport::class, $patient]);

        $shift = Shift::query()
            ->where('patient_id', $patient->id)
            ->when(! $user->isManager(), fn ($query) => $query->where('user_id', $user->id))
            ->whereIn('status', ['in_progress', 'scheduled'])
            ->latest('starts_at')
            ->first();

        return Inertia::render('reports/form', [
            'report' => null,
            'patients' => $patients->map(fn (Patient $item) => $this->patientPayload($item)),
            'selectedPatient' => $this->patientPayload($patient),
            'shift' => $shift ? $this->shiftPayload($shift) : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $patient = Patient::findOrFail($data['patient_id']);
        Gate::authorize('create', [DailyReport::class, $patient]);

        $isSubmitted = $request->string('intent')->toString() === 'submit';
        $report = DailyReport::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => $isSubmitted ? 'submitted' : 'draft',
            'submitted_at' => $isSubmitted ? now() : null,
        ]);

        if ($report->shift_id) {
            $report->shift()->update(['status' => $isSubmitted ? 'completed' : 'in_progress']);
        }

        $this->audit($request, $report, $isSubmitted ? 'submitted' : 'created');

        return $isSubmitted
            ? redirect()->route('reports.show', $report)->with('success', 'Daily report submitted securely.')
            : redirect()->route('reports.edit', $report)->with('success', 'Draft saved.');
    }

    public function show(Request $request, DailyReport $report): Response
    {
        Gate::authorize('view', $report);
        $report->load(['patient.home', 'user', 'shift', 'seizureEvents']);

        $previous = DailyReport::query()
            ->where('patient_id', $report->patient_id)
            ->where('status', 'submitted')
            ->where(function ($query) use ($report) {
                $query->whereDate('report_date', '<', $report->report_date)
                    ->orWhere(fn ($sameDay) => $sameDay->whereDate('report_date', $report->report_date)->where('id', '<', $report->id));
            })
            ->latest('report_date')->latest('id')->first();

        $next = DailyReport::query()
            ->where('patient_id', $report->patient_id)
            ->where('status', 'submitted')
            ->where(function ($query) use ($report) {
                $query->whereDate('report_date', '>', $report->report_date)
                    ->orWhere(fn ($sameDay) => $sameDay->whereDate('report_date', $report->report_date)->where('id', '>', $report->id));
            })
            ->oldest('report_date')->oldest('id')->first();

        return Inertia::render('reports/show', [
            'report' => $this->reportPayload($report),
            'previousId' => $previous?->id,
            'nextId' => $next?->id,
        ]);
    }

    public function edit(Request $request, DailyReport $report): Response
    {
        Gate::authorize('update', $report);
        $report->load(['patient.home', 'shift']);

        return Inertia::render('reports/form', [
            'report' => $this->reportPayload($report),
            'patients' => $this->accessiblePatients($request->user())->map(fn (Patient $item) => $this->patientPayload($item)),
            'selectedPatient' => $this->patientPayload($report->patient),
            'shift' => $report->shift ? $this->shiftPayload($report->shift) : null,
        ]);
    }

    public function update(Request $request, DailyReport $report): RedirectResponse
    {
        Gate::authorize('update', $report);
        $data = $this->validatedData($request);
        $isSubmitted = $request->string('intent')->toString() === 'submit';

        $report->update([
            ...$data,
            'status' => $isSubmitted ? 'submitted' : 'draft',
            'submitted_at' => $isSubmitted ? now() : null,
        ]);

        if ($report->shift_id) {
            $report->shift()->update(['status' => $isSubmitted ? 'completed' : 'in_progress']);
        }

        $this->audit($request, $report, $isSubmitted ? 'submitted' : 'updated');

        return $isSubmitted
            ? redirect()->route('reports.show', $report)->with('success', 'Daily report submitted securely.')
            : back()->with('success', 'Draft saved.');
    }

    public function print(Request $request, DailyReport $report): View
    {
        Gate::authorize('view', $report);
        $report->load(['patient.home', 'user', 'shift', 'seizureEvents']);

        return view('reports.print', compact('report'));
    }

    /**
     * The single source of truth for report filtering, shared by the history
     * screen, the spreadsheet export and the printable care book.
     *
     * @return Builder<DailyReport>
     */
    private function filteredReports(Request $request, User $user): Builder
    {
        return DailyReport::query()
            ->when(! $user->isManager(), fn (Builder $query) => $this->limitToAssignedPatients($query, $user))
            ->when($request->integer('patient'), fn ($query, $id) => $query->where('patient_id', $id))
            ->when($request->integer('worker'), fn ($query, $id) => $query->where('user_id', $id))
            ->when($request->integer('home'), fn ($query, $id) => $query->whereHas('patient', fn ($patient) => $patient->where('home_id', $id)))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('report_date', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('report_date', '<=', $request->date('to')))
            ->latest('report_date')
            ->latest('id');
    }

    /**
     * @return list<string|int|null>
     */
    private function exportRow(DailyReport $report): array
    {
        $yesNo = fn (?bool $value): string => is_null($value) ? '' : ($value ? 'Yes' : 'No');

        return [
            $report->id,
            $report->patient->home->name,
            $report->patient->first_name.' '.$report->patient->last_name,
            $report->report_date->format('Y-m-d'),
            $report->report_date->format('D'),
            ucfirst($report->shift_type),
            $report->user->name,
            ucfirst($report->status),
            $report->submitted_at?->format('Y-m-d H:i'),
            $yesNo($report->shower_taken),
            $yesNo($report->bed_bath),
            $yesNo($report->physio_completed),
            $report->personal_care_notes,
            $report->breakfast,
            $report->lunch,
            $report->dinner,
            $report->snacks,
            $report->fluids_ml,
            $report->fluids_notes,
            $report->food_notes,
            $yesNo($report->bowel_opened),
            $report->bowel_texture,
            $report->bowel_notes,
            $report->urine_status ? ucfirst(str_replace('-', ' ', $report->urine_status)) : null,
            $report->urine_notes,
            substr((string) $report->sleep_from, 0, 5) ?: null,
            substr((string) $report->sleep_to, 0, 5) ?: null,
            $report->overnight_observations,
            $report->overnight_attendance,
            $report->seizure_events_count ?? 0,
            $report->follow_up_required ? 'Yes' : 'No',
            $report->handover_notes,
        ];
    }

    /**
     * @param  EloquentCollection<int, DailyReport>  $reports
     */
    private function rangeLabel(EloquentCollection $reports): string
    {
        if ($reports->isEmpty()) {
            return 'No records';
        }

        $first = $reports->first()->report_date->format('d M Y');
        $last = $reports->last()->report_date->format('d M Y');

        return $first === $last ? $first : $first.' – '.$last;
    }

    private function auditExport(Request $request, string $event): void
    {
        AuditEvent::create([
            'user_id' => $request->user()->id,
            'auditable_type' => DailyReport::class,
            'auditable_id' => null,
            'event' => $event,
            'new_values' => array_filter($request->only(self::FILTER_KEYS)),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'shift_id' => ['nullable', 'integer', 'exists:shifts,id'],
            'report_date' => ['required', 'date'],
            'shift_type' => ['required', 'in:day,evening,night'],
            'shower_taken' => ['nullable', 'boolean'],
            'bed_bath' => ['nullable', 'boolean'],
            'personal_care_notes' => ['nullable', 'string', 'max:4000'],
            'physio_completed' => ['nullable', 'boolean'],
            'breakfast' => ['nullable', 'string', 'max:2000'],
            'lunch' => ['nullable', 'string', 'max:2000'],
            'dinner' => ['nullable', 'string', 'max:2000'],
            'snacks' => ['nullable', 'string', 'max:2000'],
            'fluids_ml' => ['nullable', 'integer', 'min:0', 'max:20000'],
            'fluids_notes' => ['nullable', 'string', 'max:2000'],
            'food_notes' => ['nullable', 'string', 'max:3000'],
            'bowel_opened' => ['nullable', 'boolean'],
            'bowel_texture' => ['nullable', 'string', 'max:100'],
            'bowel_notes' => ['nullable', 'string', 'max:2000'],
            'urine_status' => ['nullable', 'in:normal,concern,not-observed'],
            'urine_notes' => ['nullable', 'string', 'max:2000'],
            'sleep_from' => ['nullable', 'date_format:H:i'],
            'sleep_to' => ['nullable', 'date_format:H:i'],
            'overnight_observations' => ['nullable', 'string', 'max:4000'],
            'overnight_attendance' => ['nullable', 'string', 'max:4000'],
            'follow_up_required' => ['required', 'boolean'],
            'handover_notes' => ['nullable', 'string', 'max:5000', 'required_if:follow_up_required,true'],
        ]);
    }

    /**
     * @return EloquentCollection<int, Patient>
     */
    private function accessiblePatients(User $user): EloquentCollection
    {
        return Patient::query()
            ->visibleTo($user)
            ->with('home')
            ->where('status', 'active')
            ->orderBy('preferred_name')
            ->get();
    }

    /**
     * @param  Builder<DailyReport>  $query
     * @return Builder<DailyReport>
     */
    private function limitToAssignedPatients(Builder $query, User $user): Builder
    {
        return $query->whereHas(
            'patient.users',
            fn ($assignment) => Patient::constrainToOpenAssignment($assignment, $user),
        );
    }

    private function patientPayload(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'display_name' => $patient->display_name,
            'full_name' => $patient->first_name.' '.$patient->last_name,
            'initials' => $patient->initials,
            'home' => $patient->home->name,
            'accent_colour' => $patient->accent_colour,
            'support_summary' => $patient->support_summary,
        ];
    }

    private function shiftPayload(Shift $shift): array
    {
        return [
            'id' => $shift->id,
            'starts_at' => $shift->starts_at->toIso8601String(),
            'ends_at' => $shift->ends_at->toIso8601String(),
            'label' => $shift->starts_at->format('g:i A').' – '.$shift->ends_at->format('g:i A'),
        ];
    }

    private function summaryPayload(DailyReport $report): array
    {
        return [
            'id' => $report->id,
            'patient' => $report->patient->display_name,
            'initials' => $report->patient->initials,
            'accent_colour' => $report->patient->accent_colour,
            'home' => $report->patient->home->name,
            'date' => $report->report_date->format('Y-m-d'),
            'date_label' => $report->report_date->format('D, j M Y'),
            'shift_type' => $report->shift_type,
            'worker' => $report->user->name,
            'status' => $report->status,
            'follow_up_required' => $report->follow_up_required,
            'seizure_events_count' => $report->seizure_events_count ?? 0,
            'handover_notes' => $report->handover_notes,
        ];
    }

    private function reportPayload(DailyReport $report): array
    {
        return [
            ...$report->only([
                'id', 'patient_id', 'shift_id', 'shift_type', 'status', 'shower_taken',
                'bed_bath', 'personal_care_notes', 'physio_completed', 'breakfast',
                'lunch', 'dinner', 'snacks', 'fluids_ml', 'fluids_notes', 'food_notes',
                'bowel_opened', 'bowel_texture', 'bowel_notes', 'urine_status',
                'urine_notes', 'sleep_from', 'sleep_to', 'overnight_observations',
                'overnight_attendance', 'follow_up_required', 'handover_notes',
            ]),
            'report_date' => $report->report_date->format('Y-m-d'),
            'submitted_at' => $report->submitted_at?->toIso8601String(),
            'patient' => $this->patientPayload($report->patient),
            'worker' => $report->relationLoaded('user') ? $report->user->name : null,
            'shift_label' => $report->relationLoaded('shift') && $report->shift ? $this->shiftPayload($report->shift)['label'] : null,
            'seizure_events' => $report->relationLoaded('seizureEvents')
                ? $report->seizureEvents->map(fn ($event) => [
                    'id' => $event->id,
                    'occurred_at' => $event->occurred_at->toIso8601String(),
                    'duration_seconds' => $event->seizure_duration_seconds,
                    'injured' => $event->injured,
                ])
                : [],
        ];
    }

    private function audit(Request $request, DailyReport $report, string $event): void
    {
        AuditEvent::create([
            'user_id' => $request->user()->id,
            'auditable_type' => DailyReport::class,
            'auditable_id' => $report->id,
            'event' => $event,
            'new_values' => ['status' => $report->status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
