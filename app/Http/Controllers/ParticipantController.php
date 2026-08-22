<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Participant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Participant::class);
        $user = $request->user();
        $search = trim((string) $request->string('search'));

        $participants = Participant::query()
            ->visibleTo($user)
            ->with('home')
            ->where('status', 'active')
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.mb_strtolower(addcslashes($search, '%_\\')).'%';

                $query->where(function ($names) use ($term) {
                    $names->whereRaw('lower(first_name) like ?', [$term])
                        ->orWhereRaw('lower(last_name) like ?', [$term])
                        ->orWhereRaw('lower(preferred_name) like ?', [$term]);
                });
            })
            ->when($request->integer('home'), fn ($query, $id) => $query->where('home_id', $id))
            ->withMax('dailyReports as last_report_date', 'report_date')
            ->withCount(['dailyReports as follow_ups_count' => fn ($query) => $query
                ->where('follow_up_required', true)
                ->where('report_date', '>=', today()->subDays(7))])
            ->orderBy('first_name')
            ->get();

        return Inertia::render('participants/index', [
            'participants' => $participants->map(fn (Participant $participant) => [
                'id' => $participant->id,
                'display_name' => $participant->display_name,
                'full_name' => $participant->first_name.' '.$participant->last_name,
                'initials' => $participant->initials,
                'accent_colour' => $participant->accent_colour,
                'home' => $participant->home->name,
                'support_summary' => $participant->support_summary,
                'last_report_date' => $participant->last_report_date
                    ? Carbon::parse($participant->last_report_date)->format('j M Y')
                    : null,
                'follow_ups_count' => $participant->follow_ups_count,
            ]),
            'homes' => Home::query()
                ->whereIn('id', Participant::query()->visibleTo($user)->select('home_id'))
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => ['search' => $search, 'home' => (string) $request->query('home', '')],
        ]);
    }

    public function show(Request $request, Participant $participant): Response
    {
        Gate::authorize('view', $participant);
        $participant->load('home');

        $reports = DailyReport::query()
            ->where('participant_id', $participant->id)
            ->with('user')
            ->withCount('seizureEvents')
            ->latest('report_date')
            ->latest('id')
            ->limit(10)
            ->get();

        return Inertia::render('participants/show', [
            'participant' => [
                'id' => $participant->id,
                'display_name' => $participant->display_name,
                'full_name' => $participant->first_name.' '.$participant->last_name,
                'initials' => $participant->initials,
                'accent_colour' => $participant->accent_colour,
                'home' => $participant->home->name,
                'support_summary' => $participant->support_summary,
                'date_of_birth' => $participant->date_of_birth?->format('d M Y'),
                'age' => $participant->date_of_birth?->age,
            ],
            'reports' => $reports->map(fn (DailyReport $report) => [
                'id' => $report->id,
                'date_label' => $report->report_date->format('D, j M Y'),
                'shift_type' => $report->shift_type,
                'status' => $report->status,
                'worker' => $report->user->name,
                'follow_up_required' => $report->follow_up_required,
                'seizure_events_count' => $report->seizure_events_count,
                'handover_notes' => $report->handover_notes,
            ]),
            'stats' => [
                'total_reports' => DailyReport::where('participant_id', $participant->id)->count(),
                'open_follow_ups' => DailyReport::where('participant_id', $participant->id)
                    ->where('follow_up_required', true)
                    ->where('report_date', '>=', today()->subDays(7))
                    ->count(),
                'seizures_this_month' => $participant->seizureEvents()
                    ->where('occurred_at', '>=', now()->startOfMonth())
                    ->count(),
            ],
            'careTeam' => $participant->users()
                ->where('participant_user_assignments.starts_on', '<=', today())
                ->where(function ($dates) {
                    $dates->whereNull('participant_user_assignments.ends_on')
                        ->orWhere('participant_user_assignments.ends_on', '>=', today());
                })
                ->orderBy('name')
                ->get(['users.id', 'users.name'])
                ->map(fn (User $member) => ['id' => $member->id, 'name' => $member->name]),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Participant::class);

        return Inertia::render('participants/create');
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Participant::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'preferred_name' => ['nullable', 'string', 'max:80'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'home_name' => ['nullable', 'string', 'max:120'],
            'support_summary' => ['nullable', 'string', 'max:3000'],
        ]);

        $nameParts = preg_split('/\s+/', trim($data['name'])) ?: [];
        $firstName = array_shift($nameParts);
        $lastName = implode(' ', $nameParts);

        $participant = DB::transaction(function () use ($data, $firstName, $lastName, $request) {
            $home = Home::firstOrCreate(
                ['name' => trim($data['home_name'] ?? '') ?: 'Care service'],
                ['timezone' => 'Australia/Brisbane'],
            );

            $participant = Participant::create([
                'home_id' => $home->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'preferred_name' => trim($data['preferred_name'] ?? '') ?: null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'support_summary' => trim($data['support_summary'] ?? '') ?: null,
                'status' => 'active',
            ]);

            $workerIds = User::query()->where('role', 'support_worker')->pluck('id');

            if ($workerIds->isEmpty() && ! $request->user()->isManager()) {
                $workerIds->push($request->user()->id);
            }

            foreach ($workerIds as $workerId) {
                $participant->users()->attach($workerId, [
                    'starts_on' => today(),
                    'ends_on' => null,
                ]);
            }

            AuditEvent::create([
                'user_id' => $request->user()->id,
                'auditable_type' => Participant::class,
                'auditable_id' => $participant->id,
                'event' => 'created',
                'new_values' => $participant->only(['first_name', 'last_name', 'preferred_name', 'home_id']),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return $participant;
        });

        return redirect()
            ->route('reports.create', ['participant' => $participant->id])
            ->with('success', $participant->display_name.' was added to the care team.');
    }
}
