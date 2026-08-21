<?php

namespace App\Http\Controllers;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\AuditEvent;
use App\Models\Home;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $members = User::query()
            ->with(['patients' => fn ($query) => $this->currentAssignments($query)])
            ->withCount(['dailyReports as submitted_reports_count' => fn ($query) => $query->where('status', 'submitted')])
            ->withMax('dailyReports as last_report_date', 'report_date')
            ->orderByRaw("CASE WHEN role = 'support_worker' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get();

        return Inertia::render('team/index', [
            'members' => $members->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->role,
                'is_manager' => $member->isManager(),
                'patient_ids' => $member->patients->pluck('id')->values(),
                'submitted_reports_count' => $member->submitted_reports_count,
                'last_report_date' => $member->last_report_date,
            ]),
            'facilities' => Home::query()
                ->whereHas('patients', fn ($query) => $query->where('status', 'active'))
                ->with(['patients' => fn ($query) => $query->where('status', 'active')->orderBy('first_name')])
                ->orderBy('name')
                ->get()
                ->map(fn (Home $home) => [
                    'id' => $home->id,
                    'name' => $home->name,
                    'address' => $home->address,
                    'patients' => $home->patients->map(fn (Patient $patient) => [
                        'id' => $patient->id,
                        'name' => $patient->display_name,
                    ])->values(),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $data = $request->validate([
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', 'in:support_worker,manager'],
            'patients' => ['array'],
            'patients.*' => ['integer', 'exists:patients,id'],
        ]);

        $member = DB::transaction(function () use ($data, $request) {
            $member = new User([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
            ]);

            $member->email_verified_at = now();
            $member->save();

            $this->syncAssignments($member, $data['patients'] ?? []);
            $this->audit($request, $member, 'created', ['role' => $member->role]);

            return $member;
        });

        return back()->with('success', $member->name.' can now sign in to CareFlow.');
    }

    public function updateAssignments(Request $request, User $member): RedirectResponse
    {
        Gate::authorize('assignPatients', $member);

        $data = $request->validate([
            'patients' => ['array'],
            'patients.*' => ['integer', 'exists:patients,id'],
        ]);

        DB::transaction(function () use ($data, $member, $request) {
            $this->syncAssignments($member, $data['patients'] ?? []);
            $this->audit($request, $member, 'access-updated', ['patients' => $data['patients'] ?? []]);
        });

        return back()->with('success', 'Patient access updated for '.$member->name.'.');
    }

    /**
     * @param  list<int>  $patientIds
     */
    private function syncAssignments(User $member, array $patientIds): void
    {
        $current = $this->currentAssignments($member->patients())->pluck('patients.id');

        foreach ($current->diff($patientIds) as $patientId) {
            $this->assignmentRows($member, (int) $patientId)
                ->where(fn ($query) => $query->whereNull('ends_on')->orWhere('ends_on', '>=', today()))
                ->update(['ends_on' => today()->subDay(), 'updated_at' => now()]);
        }

        foreach (collect($patientIds)->diff($current) as $patientId) {
            $today = $this->assignmentRows($member, (int) $patientId)->whereDate('starts_on', today());

            if ($today->exists()) {
                $today->update(['ends_on' => null, 'updated_at' => now()]);

                continue;
            }

            $member->patients()->attach($patientId, ['starts_on' => today(), 'ends_on' => null]);
        }
    }

    private function assignmentRows(User $member, int $patientId): QueryBuilder
    {
        return DB::table('patient_user_assignments')
            ->where('user_id', $member->id)
            ->where('patient_id', $patientId);
    }

    /**
     * Limit a patient relation to assignments that are open today.
     *
     * @param  BelongsToMany<Patient, User>  $query
     * @return BelongsToMany<Patient, User>
     */
    private function currentAssignments(BelongsToMany $query): BelongsToMany
    {
        return $query
            ->wherePivot('starts_on', '<=', today())
            ->where(function ($dates) {
                $dates->whereNull('patient_user_assignments.ends_on')
                    ->orWhere('patient_user_assignments.ends_on', '>=', today());
            });
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function audit(Request $request, User $member, string $event, array $values): void
    {
        AuditEvent::create([
            'user_id' => $request->user()->id,
            'auditable_type' => User::class,
            'auditable_id' => $member->id,
            'event' => $event,
            'new_values' => $values,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
