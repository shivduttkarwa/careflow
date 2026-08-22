<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\DailyReport;
use App\Models\Participant;
use App\Models\SeizureEvent;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Only the person rostered on sees a current shift. Managers are not on
        // the floor, so their dashboard is a service overview instead.
        $currentShift = Shift::query()
            ->with(['participant.home', 'report'])
            ->where('user_id', $user->id)
            ->orderByRaw("CASE WHEN status = 'in_progress' THEN 0 WHEN status = 'scheduled' THEN 1 ELSE 2 END")
            ->orderByDesc('starts_at')
            ->first();

        $participantId = $currentShift?->participant_id;

        $recentReports = DailyReport::query()
            ->with(['participant.home', 'user'])
            ->tap(fn ($query) => $this->limitToVisibleParticipants($query, $user))
            ->when($participantId, fn ($query) => $query->where('participant_id', $participantId))
            ->where('status', 'submitted')
            ->latest('submitted_at')
            ->limit(4)
            ->get()
            ->map(fn (DailyReport $report) => $this->reportSummary($report));

        $announcement = Announcement::query()
            ->where('published_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('published_at')
            ->first();

        $acknowledged = $announcement
            ? $announcement->users()->where('users.id', $user->id)->wherePivotNotNull('acknowledged_at')->exists()
            : false;

        $participantCount = Participant::query()
            ->visibleTo($user)
            ->where('status', 'active')
            ->count();

        return Inertia::render('dashboard', [
            'participantCount' => $participantCount,
            'currentShift' => $currentShift ? [
                'id' => $currentShift->id,
                'starts_at' => $currentShift->starts_at->toIso8601String(),
                'ends_at' => $currentShift->ends_at->toIso8601String(),
                'start_label' => $currentShift->starts_at->format('g:i A'),
                'end_label' => $currentShift->ends_at->format('g:i A'),
                'status' => $currentShift->status,
                'progress' => $this->shiftProgress($currentShift),
                'report_id' => $currentShift->report?->id,
                'report_status' => $currentShift->report?->status,
                'participant' => $this->participantPayload($currentShift->participant),
            ] : null,
            'recentReports' => $recentReports,
            'announcement' => $announcement ? [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'priority' => $announcement->priority,
                'published_at' => $announcement->published_at->toIso8601String(),
                'acknowledged' => $acknowledged,
            ] : null,
            'stats' => [
                'reports_this_week' => DailyReport::query()
                    ->when(! $user->isManager(), fn ($query) => $query->where('user_id', $user->id))
                    ->whereDate('report_date', '>=', today()->startOfWeek())
                    ->count(),
                'open_follow_ups' => DailyReport::query()
                    ->tap(fn ($query) => $this->limitToVisibleParticipants($query, $user))
                    ->where('follow_up_required', true)
                    ->where('report_date', '>=', today()->subDays(7))
                    ->count(),
                'seizures_this_month' => SeizureEvent::query()
                    ->tap(fn ($query) => $this->limitToVisibleParticipants($query, $user))
                    ->where('occurred_at', '>=', now()->startOfMonth())
                    ->count(),
            ],
        ]);
    }

    /**
     * Limit a query whose model belongs to a participant to the participants this user
     * may see. Managers see every home, so nothing is added.
     */
    private function limitToVisibleParticipants(Builder $query, User $user): void
    {
        if ($user->isManager()) {
            return;
        }

        $query->whereHas('participant.users', fn ($assignment) => Participant::constrainToOpenAssignment($assignment, $user));
    }

    private function participantPayload($participant): array
    {
        return [
            'id' => $participant->id,
            'display_name' => $participant->display_name,
            'full_name' => $participant->first_name.' '.$participant->last_name,
            'initials' => $participant->initials,
            'accent_colour' => $participant->accent_colour,
            'support_summary' => $participant->support_summary,
            'home' => $participant->home->name,
        ];
    }

    private function reportSummary(DailyReport $report): array
    {
        return [
            'id' => $report->id,
            'participant_name' => $report->participant->display_name,
            'participant_initials' => $report->participant->initials,
            'accent_colour' => $report->participant->accent_colour,
            'home' => $report->participant->home->name,
            'date' => $report->report_date->format('Y-m-d'),
            'date_label' => $report->report_date->format('D, j M'),
            'shift_type' => $report->shift_type,
            'worker' => $report->user->name,
            'follow_up_required' => $report->follow_up_required,
            'handover_notes' => $report->handover_notes,
            'submitted_at' => $report->submitted_at?->toIso8601String(),
        ];
    }

    private function shiftProgress(Shift $shift): int
    {
        $duration = max(1, $shift->starts_at->diffInSeconds($shift->ends_at));
        $elapsed = $shift->starts_at->diffInSeconds(now(), false);

        return (int) max(0, min(100, round(($elapsed / $duration) * 100)));
    }
}
