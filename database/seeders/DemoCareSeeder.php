<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\AuditEvent;
use App\Models\DailyReport;
use App\Models\Home;
use App\Models\Participant;
use App\Models\SeizureEvent;
use App\Models\Shift;
use App\Models\User;
use Carbon\CarbonInterface;
use Database\Seeders\Support\CareNarrative;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DemoCareSeeder extends Seeder
{
    // Each day makes one record per shift per participant, so this multiplies fast.
    private const DAYS_OF_HISTORY = 3;

    private const SHIFT_HOURS = 8;

    private const SHIFT_PATTERN = [
        ['type' => 'day', 'start' => '07:00'],
        ['type' => 'evening', 'start' => '15:00'],
        ['type' => 'night', 'start' => '23:00'],
    ];

    private const HOMES = [
        [
            'name' => 'Banksia House',
            'address' => '24 Marlow Street, Wynnum QLD 4178',
            'workers' => ['worker@careflow.test', 'worker2@careflow.test', 'worker3@careflow.test'],
            'participants' => [
                [
                    'first' => 'Ellen', 'last' => 'Baptiste', 'preferred' => 'Ellie',
                    'dob' => '1994-03-12', 'colour' => '#115E74', 'epilepsy' => true,
                    'summary' => 'Uses a communication board to make choices. Prefers a quiet start to the morning and needs step-by-step prompting through personal care.',
                ],
                [
                    'first' => 'Marcus', 'last' => 'Vahey', 'preferred' => null,
                    'dob' => '1988-11-02', 'colour' => '#B12655', 'epilepsy' => false,
                    'summary' => 'Independent with meals. Requires supervision on stairs and support to plan the weekly shopping trip.',
                ],
                [
                    'first' => 'Tessa', 'last' => 'Whitmore', 'preferred' => 'Tess',
                    'dob' => '2001-06-25', 'colour' => '#5DA42C', 'epilepsy' => false,
                    'summary' => 'Non-verbal, communicates with gestures and a tablet. Thickened fluids at every meal as per the swallowing assessment.',
                ],
            ],
        ],
        [
            'name' => 'Wattle Grove',
            'address' => '8 Kingfisher Court, Carindale QLD 4152',
            'workers' => ['worker3@careflow.test', 'worker4@careflow.test', 'worker5@careflow.test'],
            'participants' => [
                [
                    'first' => 'Daniel', 'last' => 'Okoro', 'preferred' => 'Danny',
                    'dob' => '1979-01-18', 'colour' => '#156D87', 'epilepsy' => true,
                    'summary' => 'Epilepsy managed with twice daily medication. Wears a fall sensor overnight and needs a seizure chart completed for every event.',
                ],
                [
                    'first' => 'Sophie', 'last' => 'Tremblay', 'preferred' => 'Soph',
                    'dob' => '1996-09-08', 'colour' => '#8F6C05', 'epilepsy' => false,
                    'summary' => 'Attends the community art group on Wednesdays. Needs support with money handling and travel training.',
                ],
            ],
        ],
        [
            'name' => 'Kurrajong Lodge',
            'address' => '112 Ridgeway Avenue, Kedron QLD 4031',
            'workers' => ['worker5@careflow.test', 'worker6@careflow.test', 'worker2@careflow.test'],
            'participants' => [
                [
                    'first' => 'Harold', 'last' => 'Simmons', 'preferred' => 'Harry',
                    'dob' => '1962-04-30', 'colour' => '#8F1C44', 'epilepsy' => false,
                    'summary' => 'Uses a four wheel walker indoors. Two person assist for transfers in and out of the shower.',
                ],
                [
                    'first' => 'Nadia', 'last' => 'Farouk', 'preferred' => null,
                    'dob' => '1990-12-14', 'colour' => '#104B61', 'epilepsy' => false,
                    'summary' => 'Halal diet. Prefers female support workers for personal care and enjoys reading before bed.',
                ],
            ],
        ],
    ];

    private const ANNOUNCEMENTS = [
        [
            'title' => 'Updated medication administration policy',
            'body' => 'The medication administration policy has been revised following the July audit. Every support worker must read section 4 (witnessing and signing) and acknowledge this notice before their next shift.',
            'priority' => 'high',
            'published_days_ago' => 5,
        ],
        [
            'title' => 'Fire evacuation drill at Banksia House',
            'body' => 'A practice evacuation will run at Banksia House this Thursday between 10am and 11am. Please review each participant\'s personal emergency evacuation plan beforehand.',
            'priority' => 'normal',
            'published_days_ago' => 2,
        ],
        [
            'title' => 'New continence product supplier',
            'body' => 'We have moved to a new continence product supplier from the start of the month. Sizing has changed slightly, so please check the label against the care plan before use and report any fit issues.',
            'priority' => 'normal',
            'published_days_ago' => 9,
        ],
    ];

    private CareNarrative $narrative;

    public function run(): void
    {
        $this->narrative = new CareNarrative;

        DB::transaction(function (): void {
            $manager = User::query()->where('role', 'manager')->orderBy('id')->firstOrFail();
            $workers = User::query()->where('role', 'support_worker')->orderBy('id')->get()->keyBy('email');

            $careTeams = $this->createHomesAndParticipants($workers, $manager);

            foreach ($careTeams as $index => [$participant, $team, $epilepsy]) {
                $this->createShiftHistory($participant, $team, $epilepsy, $index);
            }

            $demoWorker = $workers[AccountSeeder::WORKER_EMAIL];
            $this->spotlightCurrentShift($careTeams[0][0], $demoWorker);
            $this->leaveOneDraft($demoWorker);
            $this->createAnnouncements($workers);
        });
    }

    /**
     * @param  Collection<string, User>  $workers
     * @return list<array{Participant, list<User>, bool}>
     */
    private function createHomesAndParticipants(Collection $workers, User $manager): array
    {
        $careTeams = [];

        foreach (self::HOMES as $homeData) {
            $home = Home::create([
                'name' => $homeData['name'],
                'address' => $homeData['address'],
                'timezone' => 'Australia/Brisbane',
            ]);

            $team = array_map(
                fn (string $email): User => $workers[$email],
                $homeData['workers'],
            );

            foreach ($homeData['participants'] as $participantData) {
                $participant = Participant::create([
                    'home_id' => $home->id,
                    'first_name' => $participantData['first'],
                    'last_name' => $participantData['last'],
                    'preferred_name' => $participantData['preferred'],
                    'date_of_birth' => $participantData['dob'],
                    'status' => 'active',
                    'support_summary' => $participantData['summary'],
                    'accent_colour' => $participantData['colour'],
                ]);

                foreach ($team as $worker) {
                    $participant->users()->attach($worker->id, [
                        'starts_on' => today()->subDays(90),
                        'ends_on' => null,
                    ]);
                }

                AuditEvent::create([
                    'user_id' => $manager->id,
                    'auditable_type' => Participant::class,
                    'auditable_id' => $participant->id,
                    'event' => 'created',
                    'new_values' => $participant->only(['first_name', 'last_name', 'preferred_name', 'home_id']),
                    'ip_address' => '203.0.113.24',
                    'user_agent' => 'Ignite care portal demo seed',
                    'created_at' => now()->subDays(90),
                ]);

                $careTeams[] = [$participant, $team, $participantData['epilepsy']];
            }
        }

        return $careTeams;
    }

    /**
     * @param  list<User>  $team
     */
    private function createShiftHistory(Participant $participant, array $team, bool $epilepsy, int $rotationOffset): void
    {
        $firstDay = today()->subDays(self::DAYS_OF_HISTORY - 1);
        $rotation = $rotationOffset;

        $lastCompleted = null;
        $recordedSeizure = false;

        for ($day = 0; $day < self::DAYS_OF_HISTORY; $day++) {
            $date = $firstDay->addDays($day);

            foreach (self::SHIFT_PATTERN as $pattern) {
                $startsAt = $date->setTimeFromTimeString($pattern['start']);
                $endsAt = $startsAt->addHours(self::SHIFT_HOURS);
                $worker = $team[$rotation % count($team)];
                $rotation++;

                if ($startsAt->isFuture()) {
                    $this->createShift($participant, $worker, $startsAt, $endsAt, 'scheduled');

                    continue;
                }

                if ($endsAt->isFuture()) {
                    $this->createShift($participant, $worker, $startsAt, $endsAt, 'in_progress');

                    continue;
                }

                $shift = $this->createShift($participant, $worker, $startsAt, $endsAt, 'completed');
                $report = $this->createReport($participant, $worker, $shift, $date, $pattern['type']);
                $lastCompleted = [$worker, $report, $startsAt, $endsAt];

                if ($epilepsy && $this->narrative->chance(16)) {
                    $this->createSeizureEvents($participant, $worker, $report, $startsAt, $endsAt);
                    $recordedSeizure = true;
                }
            }
        }

        // A short history window can draw no events at all, which would leave the
        // seizure chart with nothing to show.
        if ($epilepsy && ! $recordedSeizure && $lastCompleted !== null) {
            [$worker, $report, $startsAt, $endsAt] = $lastCompleted;
            $this->createSeizureEvents($participant, $worker, $report, $startsAt, $endsAt);
        }
    }

    private function createShift(Participant $participant, User $worker, CarbonInterface $startsAt, CarbonInterface $endsAt, string $status): Shift
    {
        return Shift::create([
            'participant_id' => $participant->id,
            'user_id' => $worker->id,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => $status,
            'handover_read_at' => $status === 'completed' ? $startsAt->addMinutes($this->narrative->between(2, 25)) : null,
        ]);
    }

    private function createReport(Participant $participant, User $worker, Shift $shift, CarbonInterface $date, string $shiftType): DailyReport
    {
        $submittedAt = $shift->ends_at->subMinutes($this->narrative->between(5, 45));

        $report = DailyReport::create([
            ...$this->reportAttributes($shiftType),
            'participant_id' => $participant->id,
            'shift_id' => $shift->id,
            'user_id' => $worker->id,
            'report_date' => $date,
            'shift_type' => $shiftType,
            'status' => 'submitted',
            'submitted_at' => $submittedAt,
            'created_at' => $shift->starts_at,
            'updated_at' => $submittedAt,
        ]);

        AuditEvent::create([
            'user_id' => $worker->id,
            'auditable_type' => DailyReport::class,
            'auditable_id' => $report->id,
            'event' => 'submitted',
            'new_values' => ['status' => 'submitted'],
            'ip_address' => '203.0.113.'.$this->narrative->between(2, 250),
            'user_agent' => 'Ignite care portal demo seed',
            'created_at' => $submittedAt,
        ]);

        return $report;
    }

    /**
     * @return array<string, mixed>
     */
    private function reportAttributes(string $shiftType): array
    {
        $narrative = $this->narrative;
        $followUp = $narrative->chance(12);

        $shared = [
            'urine_status' => $narrative->chance(80) ? 'normal' : ($narrative->chance(60) ? 'concern' : 'not-observed'),
            'urine_notes' => $narrative->pick(CareNarrative::URINE_NOTES),
            'food_notes' => $narrative->chance(55) ? $narrative->pick(CareNarrative::FOOD_NOTES) : null,
            'fluids_notes' => $narrative->chance(50) ? $narrative->pick(CareNarrative::FLUID_NOTES) : null,
            'follow_up_required' => $followUp,
            'handover_notes' => $followUp
                ? $narrative->pick(CareNarrative::FOLLOW_UP_NOTES)
                : $narrative->pick(CareNarrative::HANDOVER_NOTES),
        ];

        return [
            ...$shared,
            ...match ($shiftType) {
                'day' => $this->dayAttributes(),
                'evening' => $this->eveningAttributes(),
                default => $this->nightAttributes(),
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function dayAttributes(): array
    {
        $narrative = $this->narrative;
        $shower = $narrative->chance(85);

        return [
            ...$this->bowelAttributes(65),
            'shower_taken' => $shower,
            'bed_bath' => ! $shower && $narrative->chance(70),
            'physio_completed' => $narrative->chance(60),
            'personal_care_notes' => $narrative->pick(CareNarrative::PERSONAL_CARE_NOTES),
            'breakfast' => $narrative->pick(CareNarrative::BREAKFASTS),
            'lunch' => $narrative->pick(CareNarrative::LUNCHES),
            'snacks' => $narrative->chance(70) ? $narrative->pick(CareNarrative::SNACKS) : null,
            'fluids_ml' => $narrative->between(900, 1600),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function eveningAttributes(): array
    {
        $narrative = $this->narrative;
        $shower = $narrative->chance(25);

        return [
            ...$this->bowelAttributes(40),
            'shower_taken' => $shower,
            'bed_bath' => ! $shower && $narrative->chance(30),
            'physio_completed' => $narrative->chance(20),
            'personal_care_notes' => $narrative->chance(70) ? $narrative->pick(CareNarrative::PERSONAL_CARE_NOTES) : null,
            'dinner' => $narrative->pick(CareNarrative::DINNERS),
            'snacks' => $narrative->chance(60) ? $narrative->pick(CareNarrative::SNACKS) : null,
            'fluids_ml' => $narrative->between(500, 1100),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function nightAttributes(): array
    {
        $narrative = $this->narrative;

        return [
            ...$this->bowelAttributes(15),
            'snacks' => $narrative->chance(25) ? $narrative->pick(CareNarrative::SNACKS) : null,
            'fluids_ml' => $narrative->between(100, 450),
            'sleep_from' => sprintf('%02d:%02d', $narrative->between(21, 23), $narrative->between(0, 59)),
            'sleep_to' => sprintf('%02d:%02d', $narrative->between(5, 7), $narrative->between(0, 59)),
            'overnight_observations' => $narrative->pick(CareNarrative::OVERNIGHT_OBSERVATIONS),
            'overnight_attendance' => $narrative->pick(CareNarrative::OVERNIGHT_ATTENDANCE),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function bowelAttributes(int $openedChance): array
    {
        $opened = $this->narrative->chance($openedChance);

        return [
            'bowel_opened' => $opened,
            'bowel_texture' => $opened ? $this->narrative->pick(CareNarrative::BOWEL_TEXTURES) : null,
            'bowel_notes' => $opened || $this->narrative->chance(35)
                ? $this->narrative->pick(CareNarrative::BOWEL_NOTES)
                : null,
        ];
    }

    private function createSeizureEvents(Participant $participant, User $worker, DailyReport $report, CarbonInterface $startsAt, CarbonInterface $endsAt): void
    {
        $narrative = $this->narrative;
        $count = $narrative->chance(20) ? 2 : 1;

        for ($index = 0; $index < $count; $index++) {
            $occurredAt = $startsAt->addMinutes($narrative->between(20, (self::SHIFT_HOURS * 60) - 20));
            $fell = $narrative->chance(25);
            $injured = $fell && $narrative->chance(30);

            SeizureEvent::create([
                'participant_id' => $participant->id,
                'daily_report_id' => $report->id,
                'user_id' => $worker->id,
                'occurred_at' => $occurredAt,
                'awareness' => $narrative->some(CareNarrative::SEIZURE_AWARENESS, 1, 2),
                'facial_expressions' => $narrative->some(CareNarrative::SEIZURE_FACIAL, 1, 3),
                'body_movements' => $narrative->some(CareNarrative::SEIZURE_BODY, 1, 3),
                'automatic_movements' => $narrative->chance(45) ? $narrative->some(CareNarrative::SEIZURE_AUTOMATIC, 1, 2) : [],
                'speech' => $narrative->some(CareNarrative::SEIZURE_SPEECH, 1, 2),
                'fell' => $fell,
                'fall_notes' => $fell ? 'Lowered to the floor safely with a cushion under the head.' : null,
                'after_effects' => $narrative->some(CareNarrative::SEIZURE_AFTER_EFFECTS, 1, 3),
                'seizure_duration_seconds' => $narrative->between(25, 210),
                'recovery_duration_minutes' => $narrative->between(5, 90),
                'incontinence' => $narrative->chance(30) ? $narrative->pick(['urine', 'bowel', 'both']) : null,
                'injured' => $injured,
                'injury_notes' => $injured ? 'Small graze to the left elbow, cleaned and dressed.' : null,
                'qas_called' => $injured && $narrative->chance(40),
                'incident_report_completed' => $injured || $narrative->chance(35),
                'observer_name' => $worker->name,
                'submitted_at' => $occurredAt->addMinutes($narrative->between(10, 120))->min($endsAt),
            ]);
        }
    }

    /**
     * Hand the shift that is running right now to the demo login so the
     * dashboard opens on a live shift with the daily note still to write.
     */
    private function spotlightCurrentShift(Participant $participant, User $worker): void
    {
        Shift::query()
            ->where('participant_id', $participant->id)
            ->where('status', 'in_progress')
            ->update(['user_id' => $worker->id]);
    }

    private function leaveOneDraft(User $worker): void
    {
        $report = DailyReport::query()
            ->where('user_id', $worker->id)
            ->where('status', 'submitted')
            ->latest('report_date')
            ->latest('id')
            ->first();

        if (! $report) {
            return;
        }

        $report->update(['status' => 'draft', 'submitted_at' => null]);

        AuditEvent::query()
            ->where('auditable_type', DailyReport::class)
            ->where('auditable_id', $report->id)
            ->update(['event' => 'created']);
    }

    /**
     * @param  Collection<string, User>  $workers
     */
    private function createAnnouncements(Collection $workers): void
    {
        foreach (self::ANNOUNCEMENTS as $data) {
            $publishedAt = now()->subDays($data['published_days_ago']);

            $announcement = Announcement::create([
                'title' => $data['title'],
                'body' => $data['body'],
                'priority' => $data['priority'],
                'published_at' => $publishedAt,
                'expires_at' => null,
            ]);

            foreach ($workers as $worker) {
                if (! $this->narrative->chance(65)) {
                    continue;
                }

                $readAt = $publishedAt->addHours($this->narrative->between(1, 40));

                $announcement->users()->attach($worker->id, [
                    'read_at' => $readAt,
                    'acknowledged_at' => $this->narrative->chance(75) ? $readAt->addMinutes(3) : null,
                ]);
            }
        }
    }
}
