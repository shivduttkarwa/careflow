<?php

namespace App\Http\Controllers;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\AuditEvent;
use App\Models\Participant;
use App\Models\User;
use Carbon\Carbon;
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
            ->with(['participants' => fn ($query) => $this->currentAssignments($query)])
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
                'participant_ids' => $member->participants->pluck('id')->values(),
                'submitted_reports_count' => $member->submitted_reports_count,
                'last_report_date' => $member->last_report_date
                    ? Carbon::parse($member->last_report_date)->format('j M Y')
                    : null,
            ]),
            'participants' => Participant::query()
                ->with('home')
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get()
                ->map(fn (Participant $participant) => [
                    'id' => $participant->id,
                    'name' => $participant->display_name,
                    'home' => $participant->home->name,
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
            'participants' => ['array'],
            'participants.*' => ['integer', 'exists:participants,id'],
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

            $this->syncAssignments($member, $data['participants'] ?? []);
            $this->audit($request, $member, 'created', ['role' => $member->role]);

            return $member;
        });

        return back()->with('success', $member->name.' can now sign in to '.config('app.name').'.');
    }

    public function updateAssignments(Request $request, User $member): RedirectResponse
    {
        Gate::authorize('assignParticipants', $member);

        $data = $request->validate([
            'participants' => ['array'],
            'participants.*' => ['integer', 'exists:participants,id'],
        ]);

        DB::transaction(function () use ($data, $member, $request) {
            $this->syncAssignments($member, $data['participants'] ?? []);
            $this->audit($request, $member, 'access-updated', ['participants' => $data['participants'] ?? []]);
        });

        return back()->with('success', 'Participant access updated for '.$member->name.'.');
    }

    /**
     * @param  list<int>  $participantIds
     */
    private function syncAssignments(User $member, array $participantIds): void
    {
        $current = $this->currentAssignments($member->participants())->pluck('participants.id');

        foreach ($current->diff($participantIds) as $participantId) {
            $this->assignmentRows($member, (int) $participantId)
                ->where(fn ($query) => $query->whereNull('ends_on')->orWhere('ends_on', '>=', today()))
                ->update(['ends_on' => today()->subDay(), 'updated_at' => now()]);
        }

        foreach (collect($participantIds)->diff($current) as $participantId) {
            $today = $this->assignmentRows($member, (int) $participantId)->whereDate('starts_on', today());

            if ($today->exists()) {
                $today->update(['ends_on' => null, 'updated_at' => now()]);

                continue;
            }

            $member->participants()->attach($participantId, ['starts_on' => today(), 'ends_on' => null]);
        }
    }

    private function assignmentRows(User $member, int $participantId): QueryBuilder
    {
        return DB::table('participant_user_assignments')
            ->where('user_id', $member->id)
            ->where('participant_id', $participantId);
    }

    /**
     * Limit a participant relation to assignments that are open today.
     *
     * @param  BelongsToMany<Participant, User>  $query
     * @return BelongsToMany<Participant, User>
     */
    private function currentAssignments(BelongsToMany $query): BelongsToMany
    {
        return $query
            ->wherePivot('starts_on', '<=', today())
            ->where(function ($dates) {
                $dates->whereNull('participant_user_assignments.ends_on')
                    ->orWhere('participant_user_assignments.ends_on', '>=', today());
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
