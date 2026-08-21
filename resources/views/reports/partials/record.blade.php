<article class="page">
    <header>
        <div><div class="brand">CareFlow · Secure care record</div><h1>Daily Care Needs Record</h1></div>
        <div class="meta"><strong>{{ $report->patient->home->name }}</strong><br>Record #{{ str_pad((string) $report->id, 6, '0', STR_PAD_LEFT) }}</div>
    </header>

    <div class="identity">
        <div><div class="label">Participant</div><div class="value">{{ $report->patient->first_name }} {{ $report->patient->last_name }}</div></div>
        <div><div class="label">Date</div><div class="value">{{ $report->report_date->format('d M Y') }}</div></div>
        <div><div class="label">Shift</div><div class="value">{{ ucfirst($report->shift_type) }}{{ $report->shift ? ' · '.$report->shift->starts_at->format('g:i A').'–'.$report->shift->ends_at->format('g:i A') : '' }}</div></div>
        <div><div class="label">Staff member</div><div class="value">{{ $report->user->name }}</div></div>
    </div>

    <section>
        <h2>Personal care</h2>
        <dl>
            <div><dt>Shower completed</dt><dd>{{ is_null($report->shower_taken) ? 'Not recorded' : ($report->shower_taken ? 'Yes' : 'No') }}</dd></div>
            <div><dt>Bed bath completed</dt><dd>{{ is_null($report->bed_bath) ? 'Not recorded' : ($report->bed_bath ? 'Yes' : 'No') }}</dd></div>
            <div><dt>Physio completed</dt><dd>{{ is_null($report->physio_completed) ? 'Not recorded' : ($report->physio_completed ? 'Yes' : 'No') }}</dd></div>
            <div><dt>Notes</dt><dd>{{ $report->personal_care_notes ?: 'No additional notes' }}</dd></div>
        </dl>
    </section>

    <section class="highlight">
        <h2>Food &amp; fluids</h2>
        <dl>
            <div><dt>Breakfast</dt><dd>{{ $report->breakfast ?: 'Not recorded' }}</dd></div>
            <div><dt>Lunch</dt><dd>{{ $report->lunch ?: 'Not recorded' }}</dd></div>
            <div><dt>Dinner</dt><dd>{{ $report->dinner ?: 'Not recorded' }}</dd></div>
            <div><dt>Snacks</dt><dd>{{ $report->snacks ?: 'Not recorded' }}</dd></div>
            <div><dt>Total fluids</dt><dd>{{ $report->fluids_ml ? $report->fluids_ml.' mL' : 'Not recorded' }}</dd></div>
            <div><dt>Fluid notes</dt><dd>{{ $report->fluids_notes ?: 'No notes' }}</dd></div>
        </dl>
    </section>

    <section class="highlight">
        <h2>Bowel &amp; urine</h2>
        <dl>
            <div><dt>Bowel opened</dt><dd>{{ is_null($report->bowel_opened) ? 'Not recorded' : ($report->bowel_opened ? 'Yes' : 'No') }}</dd></div>
            <div><dt>Texture</dt><dd>{{ $report->bowel_texture ?: 'Not applicable' }}</dd></div>
            <div><dt>Bowel notes</dt><dd>{{ $report->bowel_notes ?: 'No notes' }}</dd></div>
            <div><dt>Urine observation</dt><dd>{{ $report->urine_status ? ucfirst(str_replace('-', ' ', $report->urine_status)) : 'Not recorded' }}</dd></div>
            <div><dt>Urine notes</dt><dd>{{ $report->urine_notes ?: 'No notes' }}</dd></div>
        </dl>
    </section>

    <section>
        <h2>Overnight</h2>
        <dl>
            <div><dt>Sleep time</dt><dd>{{ $report->sleep_from || $report->sleep_to ? substr((string) $report->sleep_from, 0, 5).' – '.substr((string) $report->sleep_to, 0, 5) : 'Not recorded' }}</dd></div>
            <div><dt>Observations</dt><dd>{{ $report->overnight_observations ?: 'No overnight observations' }}</dd></div>
            <div><dt>Attendance</dt><dd>{{ $report->overnight_attendance ?: 'No attendance recorded' }}</dd></div>
        </dl>
    </section>

    <section>
        <h2>Handover</h2>
        <p>{{ $report->handover_notes ?: 'No additional handover notes.' }}</p>
        @if($report->follow_up_required)
            <div class="follow-up"><strong>Follow-up required</strong><br>{{ $report->handover_notes }}</div>
        @endif
    </section>

    @if($report->seizureEvents->isNotEmpty())
        <section>
            <h2>Linked seizure events</h2>
            <dl>
                @foreach($report->seizureEvents as $event)
                    <div><dt>{{ $event->occurred_at->format('d M Y, g:i A') }}</dt><dd>{{ $event->seizure_duration_seconds }} seconds · {{ $event->injured ? 'Injury recorded' : 'No injury' }}</dd></div>
                @endforeach
            </dl>
        </section>
    @endif

    <footer>
        <span>{{ $report->submitted_at ? 'Submitted '.$report->submitted_at->format('d M Y, g:i A') : 'Draft — not yet submitted' }}</span>
        <span>Confidential care record · Access controlled</span>
    </footer>
</article>
