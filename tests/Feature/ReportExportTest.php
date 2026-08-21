<?php

namespace Tests\Feature;

use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_filter_the_history_by_home(): void
    {
        [$banksia, $wattle] = $this->twoHomes();

        $this->actingAs($this->manager())
            ->get(route('reports.index', ['home' => $banksia->home_id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('reports.data', 1)
                ->where('reports.data.0.patient', $banksia->display_name)
                ->has('homes', 2));

        $this->actingAs($this->manager())
            ->get(route('reports.index', ['home' => $wattle->home_id]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('reports.data', 1)
                ->where('reports.data.0.patient', $wattle->display_name));
    }

    public function test_csv_export_returns_the_filtered_records(): void
    {
        [$banksia, $wattle] = $this->twoHomes();

        $response = $this->actingAs($this->manager())
            ->get(route('reports.export', ['home' => $banksia->home_id]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $csv = $response->streamedContent();

        $this->assertStringContainsString('Bowel opened', $csv);
        $this->assertStringContainsString('Handover notes', $csv);
        $this->assertStringContainsString($banksia->last_name, $csv);
        $this->assertStringNotContainsString($wattle->last_name, $csv);

        $this->assertDatabaseHas('audit_events', ['event' => 'exported-csv']);
    }

    public function test_csv_export_never_leaks_patients_a_worker_is_not_assigned_to(): void
    {
        [$assigned, $unassigned] = $this->twoHomes();

        $worker = User::factory()->create(['role' => 'support_worker']);
        $assigned->users()->attach($worker->id, ['starts_on' => today()->subDay(), 'ends_on' => null]);

        $csv = $this->actingAs($worker)
            ->get(route('reports.export'))
            ->streamedContent();

        $this->assertStringContainsString($assigned->last_name, $csv);
        $this->assertStringNotContainsString($unassigned->last_name, $csv);
    }

    public function test_care_book_renders_every_filtered_record_on_its_own_page(): void
    {
        [$banksia, $wattle] = $this->twoHomes();

        $response = $this->actingAs($this->manager())
            ->get(route('reports.book', ['home' => $banksia->home_id]));

        $response->assertOk();
        $response->assertSee('Daily Care Needs Record');
        $response->assertSee($banksia->last_name);
        $response->assertDontSee($wattle->last_name);

        $this->assertDatabaseHas('audit_events', ['event' => 'exported-book']);
    }

    private function manager(): User
    {
        return User::factory()->create(['role' => 'manager']);
    }

    /**
     * Two patients in two different homes, each with one submitted report.
     *
     * @return array{Patient, Patient}
     */
    private function twoHomes(): array
    {
        $worker = User::factory()->create(['role' => 'support_worker']);

        $patients = collect([
            ['Banksia House', 'Ava', 'Mitchell'],
            ['Wattle Grove', 'Noah', 'Fitzgerald'],
        ])->map(function (array $row) use ($worker): Patient {
            [$homeName, $firstName, $lastName] = $row;

            $patient = Patient::create([
                'home_id' => Home::create(['name' => $homeName])->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]);

            DailyReport::create([
                'patient_id' => $patient->id,
                'user_id' => $worker->id,
                'report_date' => today(),
                'shift_type' => 'day',
                'status' => 'submitted',
                'bowel_opened' => true,
                'bowel_texture' => 'Type 4 - smooth and soft',
                'follow_up_required' => false,
                'handover_notes' => 'Settled and comfortable.',
                'submitted_at' => now(),
            ]);

            return $patient;
        });

        return [$patients[0], $patients[1]];
    }
}
