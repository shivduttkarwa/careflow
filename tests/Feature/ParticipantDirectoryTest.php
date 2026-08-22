<?php

namespace Tests\Feature;

use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParticipantDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_worker_only_sees_the_participants_they_are_assigned_to(): void
    {
        [$assigned, $unassigned] = $this->twoParticipants();
        $worker = User::factory()->create(['role' => 'support_worker']);
        $assigned->users()->attach($worker->id, ['starts_on' => today()->subDay(), 'ends_on' => null]);

        $this->actingAs($worker)
            ->get(route('participants.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('participants', 1)
                ->where('participants.0.display_name', $assigned->display_name)
                ->has('homes', 1));

        $this->actingAs($worker)->get(route('participants.show', $unassigned))->assertForbidden();
    }

    public function test_a_manager_sees_every_participant_and_can_search_by_name(): void
    {
        [$ava, $noah] = $this->twoParticipants();
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)
            ->get(route('participants.index'))
            ->assertInertia(fn (Assert $page) => $page->has('participants', 2));

        foreach (['fitz', 'FITZ', 'noah'] as $term) {
            $this->actingAs($manager)
                ->get(route('participants.index', ['search' => $term]))
                ->assertInertia(fn (Assert $page) => $page
                    ->has('participants', 1)
                    ->where('participants.0.display_name', $noah->display_name));
        }

        $this->actingAs($manager)
            ->get(route('participants.index', ['search' => '%']))
            ->assertInertia(fn (Assert $page) => $page->has('participants', 0));

        $this->actingAs($manager)
            ->get(route('participants.index', ['home' => $ava->home_id]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('participants', 1)
                ->where('participants.0.display_name', $ava->display_name));
    }

    public function test_the_participant_profile_lists_recent_shifts_for_that_participant_only(): void
    {
        [$ava, $noah] = $this->twoParticipants();
        $worker = User::factory()->create(['role' => 'support_worker']);

        foreach ([$ava, $noah] as $participant) {
            DailyReport::create([
                'participant_id' => $participant->id,
                'user_id' => $worker->id,
                'report_date' => today(),
                'shift_type' => 'day',
                'status' => 'submitted',
                'follow_up_required' => $participant->is($ava),
                'handover_notes' => 'Handover for '.$participant->first_name,
                'submitted_at' => now(),
            ]);
        }

        $this->actingAs(User::factory()->create(['role' => 'manager']))
            ->get(route('participants.show', $ava))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('participant.display_name', $ava->display_name)
                ->has('reports', 1)
                ->where('reports.0.handover_notes', 'Handover for Ava')
                ->where('stats.total_reports', 1)
                ->where('stats.open_follow_ups', 1));
    }

    /**
     * @return array{Participant, Participant}
     */
    private function twoParticipants(): array
    {
        $participants = collect([
            ['Banksia House', 'Ava', 'Mitchell'],
            ['Wattle Grove', 'Noah', 'Fitzgerald'],
        ])->map(fn (array $row) => Participant::create([
            'home_id' => Home::create(['name' => $row[0]])->id,
            'first_name' => $row[1],
            'last_name' => $row[2],
        ]));

        return [$participants[0], $participants[1]];
    }
}
