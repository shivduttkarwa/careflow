<?php

namespace Tests\Feature;

use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Participant;
use App\Models\SeizureEvent;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CareWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_worker_can_only_open_a_daily_note_for_an_assigned_participant(): void
    {
        [$worker, $participant] = $this->careContext(assigned: false);

        $this->actingAs($worker)
            ->get(route('reports.create', ['participant' => $participant->id]))
            ->assertForbidden();

        $participant->users()->attach($worker->id, [
            'starts_on' => today()->subDay(),
            'ends_on' => null,
        ]);

        $this->actingAs($worker)
            ->get(route('reports.create', ['participant' => $participant->id]))
            ->assertOk();
    }

    public function test_assigned_worker_can_submit_a_daily_report(): void
    {
        [$worker, $participant] = $this->careContext();

        $response = $this->actingAs($worker)->post(route('reports.store'), [
            'participant_id' => $participant->id,
            'shift_id' => null,
            'report_date' => today()->format('Y-m-d'),
            'shift_type' => 'day',
            'shower_taken' => true,
            'bed_bath' => false,
            'physio_completed' => true,
            'breakfast' => 'Porridge and tea',
            'fluids_ml' => 800,
            'bowel_opened' => false,
            'urine_status' => 'normal',
            'follow_up_required' => false,
            'handover_notes' => 'Settled and comfortable throughout the shift.',
            'intent' => 'submit',
        ]);

        $report = DailyReport::firstOrFail();

        $response->assertRedirect(route('reports.show', $report));
        $this->assertSame('submitted', $report->status);
        $this->assertNotNull($report->submitted_at);
        $this->assertDatabaseHas('audit_events', [
            'auditable_id' => $report->id,
            'event' => 'submitted',
        ]);
    }

    public function test_submitted_report_is_locked_and_unassigned_workers_cannot_view_it(): void
    {
        [$worker, $participant] = $this->careContext();
        $otherWorker = User::factory()->create(['role' => 'support_worker']);

        $report = DailyReport::create([
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
            'report_date' => today(),
            'shift_type' => 'day',
            'status' => 'submitted',
            'follow_up_required' => false,
            'submitted_at' => now(),
        ]);

        $this->actingAs($worker)
            ->get(route('reports.edit', $report))
            ->assertForbidden();

        $this->actingAs($otherWorker)
            ->get(route('reports.show', $report))
            ->assertForbidden();
    }

    public function test_manager_can_review_reports_for_any_participant(): void
    {
        [$worker, $participant] = $this->careContext();
        $manager = User::factory()->create(['role' => 'manager']);

        $report = DailyReport::create([
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
            'report_date' => today(),
            'shift_type' => 'day',
            'status' => 'submitted',
            'follow_up_required' => false,
            'submitted_at' => now(),
        ]);

        $this->actingAs($manager)
            ->get(route('reports.show', $report))
            ->assertOk();
    }

    public function test_worker_can_add_a_participant_and_is_assigned_to_their_care_team(): void
    {
        $worker = User::factory()->create(['role' => 'support_worker']);

        $response = $this->actingAs($worker)->post(route('participants.store'), [
            'name' => 'Taylor Morgan',
            'preferred_name' => 'Tay',
            'home_name' => 'Community Care',
            'support_summary' => 'Uses clear, unhurried communication.',
        ]);

        $participant = Participant::firstOrFail();

        $response->assertRedirect(route('reports.create', ['participant' => $participant->id]));
        $this->assertSame('Taylor', $participant->first_name);
        $this->assertSame('Morgan', $participant->last_name);
        $this->assertSame('Tay', $participant->preferred_name);
        $this->assertDatabaseHas('participant_user_assignments', [
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
        ]);
        $this->assertDatabaseHas('audit_events', [
            'auditable_id' => $participant->id,
            'event' => 'created',
        ]);
    }

    public function test_empty_account_is_sent_to_participant_setup_before_starting_a_note(): void
    {
        $worker = User::factory()->create(['role' => 'support_worker']);

        $this->actingAs($worker)
            ->get(route('reports.create'))
            ->assertRedirect(route('participants.create'));
    }

    public function test_demo_seed_creates_a_reviewable_care_history(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', count(AccountSeeder::ACCOUNTS));
        $this->assertDatabaseCount('homes', 3);
        $this->assertDatabaseCount('participants', 7);
        $this->assertDatabaseCount('announcements', 3);

        $this->assertGreaterThan(20, DailyReport::count());
        $this->assertGreaterThan(0, SeizureEvent::count());
        $this->assertSame(1, DailyReport::where('status', 'draft')->count());

        $demoWorker = User::where('email', AccountSeeder::WORKER_EMAIL)->firstOrFail();

        $this->assertTrue(
            $demoWorker->shifts()->where('status', 'in_progress')->exists(),
            'The demo login should open on a shift that is running now.',
        );
    }

    public function test_the_demo_login_lands_on_a_dashboard_with_a_live_shift(): void
    {
        $this->seed();

        $this->actingAs(User::where('email', AccountSeeder::WORKER_EMAIL)->firstOrFail())
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('currentShift.status', 'in_progress')
                ->where('currentShift.report_id', null)
                ->has('recentReports', 4)
                ->has('announcement'));
    }

    public function test_a_manager_is_never_shown_someone_elses_shift_as_their_own(): void
    {
        $this->seed();

        $this->actingAs(User::where('email', AccountSeeder::MANAGER_EMAIL)->firstOrFail())
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('currentShift', null)
                ->where('participantCount', 7));
    }

    public function test_dashboard_counts_only_the_current_week_of_reports(): void
    {
        $this->seed();

        // The demo history is deliberately short, so add a record outside the
        // current week to prove the dashboard filters rather than counts all.
        $recent = DailyReport::latest('id')->firstOrFail();
        DailyReport::create([
            'participant_id' => $recent->participant_id,
            'user_id' => $recent->user_id,
            'report_date' => today()->startOfWeek()->subWeeks(3),
            'shift_type' => 'day',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $expected = DailyReport::whereDate('report_date', '>=', today()->startOfWeek())->count();

        $this->assertLessThan(DailyReport::count(), $expected);

        $this->actingAs(User::where('email', AccountSeeder::MANAGER_EMAIL)->firstOrFail())
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->where('stats.reports_this_week', $expected));
    }

    public function test_the_login_screen_does_not_prefill_credentials(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertDontSee('worker@careflow.test')
            ->assertDontSee('defaultValue="password"', false);
    }

    /** @return array{User, Participant} */
    private function careContext(bool $assigned = true): array
    {
        $worker = User::factory()->create(['role' => 'support_worker']);
        $home = Home::create(['name' => 'Banksia House']);
        $participant = Participant::create([
            'home_id' => $home->id,
            'first_name' => 'Ava',
            'last_name' => 'Mitchell',
            'preferred_name' => 'Ava',
        ]);

        if ($assigned) {
            $participant->users()->attach($worker->id, [
                'starts_on' => today()->subDay(),
                'ends_on' => null,
            ]);
        }

        return [$worker, $participant];
    }
}
