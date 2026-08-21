<?php

namespace Tests\Feature;

use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PatientDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_worker_only_sees_the_patients_they_are_assigned_to(): void
    {
        [$assigned, $unassigned] = $this->twoPatients();
        $worker = User::factory()->create(['role' => 'support_worker']);
        $assigned->users()->attach($worker->id, ['starts_on' => today()->subDay(), 'ends_on' => null]);

        $this->actingAs($worker)
            ->get(route('patients.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('patients', 1)
                ->where('patients.0.display_name', $assigned->display_name)
                ->has('homes', 1));

        $this->actingAs($worker)->get(route('patients.show', $unassigned))->assertForbidden();
    }

    public function test_a_manager_sees_every_patient_and_can_search_by_name(): void
    {
        [$ava, $noah] = $this->twoPatients();
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)
            ->get(route('patients.index'))
            ->assertInertia(fn (Assert $page) => $page->has('patients', 2));

        foreach (['fitz', 'FITZ', 'noah'] as $term) {
            $this->actingAs($manager)
                ->get(route('patients.index', ['search' => $term]))
                ->assertInertia(fn (Assert $page) => $page
                    ->has('patients', 1)
                    ->where('patients.0.display_name', $noah->display_name));
        }

        $this->actingAs($manager)
            ->get(route('patients.index', ['search' => '%']))
            ->assertInertia(fn (Assert $page) => $page->has('patients', 0));

        $this->actingAs($manager)
            ->get(route('patients.index', ['home' => $ava->home_id]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('patients', 1)
                ->where('patients.0.display_name', $ava->display_name));
    }

    public function test_the_patient_profile_lists_recent_shifts_for_that_patient_only(): void
    {
        [$ava, $noah] = $this->twoPatients();
        $worker = User::factory()->create(['role' => 'support_worker']);

        foreach ([$ava, $noah] as $patient) {
            DailyReport::create([
                'patient_id' => $patient->id,
                'user_id' => $worker->id,
                'report_date' => today(),
                'shift_type' => 'day',
                'status' => 'submitted',
                'follow_up_required' => $patient->is($ava),
                'handover_notes' => 'Handover for '.$patient->first_name,
                'submitted_at' => now(),
            ]);
        }

        $this->actingAs(User::factory()->create(['role' => 'manager']))
            ->get(route('patients.show', $ava))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('patient.display_name', $ava->display_name)
                ->has('reports', 1)
                ->where('reports.0.handover_notes', 'Handover for Ava')
                ->where('stats.total_reports', 1)
                ->where('stats.open_follow_ups', 1));
    }

    /**
     * @return array{Patient, Patient}
     */
    private function twoPatients(): array
    {
        $patients = collect([
            ['Banksia House', 'Ava', 'Mitchell'],
            ['Wattle Grove', 'Noah', 'Fitzgerald'],
        ])->map(fn (array $row) => Patient::create([
            'home_id' => Home::create(['name' => $row[0]])->id,
            'first_name' => $row[1],
            'last_name' => $row[2],
        ]));

        return [$patients[0], $patients[1]];
    }
}
