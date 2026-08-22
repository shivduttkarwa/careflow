<?php

namespace Tests\Feature;

use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TeamAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_public_registration_route_is_not_available(): void
    {
        $this->assertFalse(Route::has('register'));

        $this->post('/register', [
            'name' => 'Uninvited Person',
            'email' => 'uninvited@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertNotFound();

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_support_workers_cannot_reach_team_access(): void
    {
        $worker = User::factory()->create(['role' => 'support_worker']);

        $this->actingAs($worker)->get(route('team.index'))->assertForbidden();

        $this->actingAs($worker)->post(route('team.store'), [
            'name' => 'New Worker',
            'email' => 'new@careflow.test',
            'role' => 'support_worker',
            'password' => 'demo-password-12',
            'password_confirmation' => 'demo-password-12',
        ])->assertForbidden();
    }

    public function test_manager_creates_a_worker_with_participant_access(): void
    {
        $participant = $this->participant();

        $this->actingAs($this->manager())->post(route('team.store'), [
            'name' => 'Jordan Fielding',
            'email' => 'jordan@careflow.test',
            'role' => 'support_worker',
            'password' => 'demo-password-12',
            'password_confirmation' => 'demo-password-12',
            'participants' => [$participant->id],
        ])->assertRedirect();

        $worker = User::where('email', 'jordan@careflow.test')->firstOrFail();

        $this->assertSame('support_worker', $worker->role);
        $this->assertNotNull($worker->email_verified_at);
        $this->assertDatabaseHas('participant_user_assignments', [
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
            'ends_on' => null,
        ]);
        $this->assertDatabaseHas('audit_events', [
            'auditable_type' => User::class,
            'auditable_id' => $worker->id,
            'event' => 'created',
        ]);

        $this->actingAs($worker)->get(route('reports.create', ['participant' => $participant->id]))->assertOk();
    }

    public function test_revoking_access_hides_the_participant_from_the_worker(): void
    {
        $participant = $this->participant();
        $worker = User::factory()->create(['role' => 'support_worker']);
        $participant->users()->attach($worker->id, ['starts_on' => today()->subDays(5), 'ends_on' => null]);

        $report = DailyReport::create([
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
            'report_date' => today(),
            'shift_type' => 'day',
            'status' => 'submitted',
            'follow_up_required' => false,
            'submitted_at' => now(),
        ]);

        $this->actingAs($worker)->get(route('reports.show', $report))->assertOk();

        $this->actingAs($this->manager())
            ->put(route('team.assignments', $worker), ['participants' => []])
            ->assertRedirect();

        $this->actingAs($worker)->get(route('reports.show', $report))->assertForbidden();

        $this->assertDatabaseHas('audit_events', [
            'auditable_type' => User::class,
            'auditable_id' => $worker->id,
            'event' => 'access-updated',
        ]);
    }

    public function test_granting_access_back_reopens_the_assignment(): void
    {
        $participant = $this->participant();
        $worker = User::factory()->create(['role' => 'support_worker']);
        $manager = $this->manager();

        $this->actingAs($manager)->put(route('team.assignments', $worker), ['participants' => [$participant->id]]);
        $this->actingAs($manager)->put(route('team.assignments', $worker), ['participants' => []]);
        $this->actingAs($manager)->put(route('team.assignments', $worker), ['participants' => [$participant->id]]);

        $this->assertTrue($worker->fresh()->can('view', $participant));
        $this->assertSame(1, $worker->participants()->count());
    }

    public function test_manager_access_cannot_be_narrowed_to_specific_participants(): void
    {
        $other = User::factory()->create(['role' => 'manager']);

        $this->actingAs($this->manager())
            ->put(route('team.assignments', $other), ['participants' => []])
            ->assertForbidden();
    }

    private function manager(): User
    {
        return User::factory()->create(['role' => 'manager']);
    }

    private function participant(): Participant
    {
        return Participant::create([
            'home_id' => Home::create(['name' => 'Banksia House'])->id,
            'first_name' => 'Ava',
            'last_name' => 'Mitchell',
        ]);
    }
}
