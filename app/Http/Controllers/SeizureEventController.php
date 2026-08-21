<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\DailyReport;
use App\Models\Patient;
use App\Models\SeizureEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SeizureEventController extends Controller
{
    public function create(Request $request): Response
    {
        $patient = Patient::with('home')->findOrFail($request->integer('patient'));
        Gate::authorize('view', $patient);

        $report = $request->integer('report')
            ? DailyReport::where('patient_id', $patient->id)->findOrFail($request->integer('report'))
            : null;

        return Inertia::render('seizures/create', [
            'patient' => [
                'id' => $patient->id,
                'display_name' => $patient->display_name,
                'full_name' => $patient->first_name.' '.$patient->last_name,
                'initials' => $patient->initials,
                'home' => $patient->home->name,
                'accent_colour' => $patient->accent_colour,
            ],
            'reportId' => $report?->id,
            'observerName' => $request->user()->name,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'daily_report_id' => ['nullable', 'exists:daily_reports,id'],
            'occurred_at' => ['required', 'date'],
            'awareness' => ['array'],
            'awareness.*' => ['string', 'max:80'],
            'facial_expressions' => ['array'],
            'facial_expressions.*' => ['string', 'max:80'],
            'body_movements' => ['array'],
            'body_movements.*' => ['string', 'max:80'],
            'automatic_movements' => ['array'],
            'automatic_movements.*' => ['string', 'max:80'],
            'speech' => ['array'],
            'speech.*' => ['string', 'max:80'],
            'fell' => ['required', 'boolean'],
            'fall_notes' => ['nullable', 'string', 'max:2000'],
            'after_effects' => ['array'],
            'after_effects.*' => ['string', 'max:80'],
            'seizure_duration_seconds' => ['required', 'integer', 'min:1', 'max:86400'],
            'recovery_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'incontinence' => ['nullable', 'in:none,bowel,urine,both'],
            'injured' => ['required', 'boolean'],
            'injury_notes' => ['nullable', 'string', 'max:3000', 'required_if:injured,true'],
            'qas_called' => ['required', 'boolean'],
            'incident_report_completed' => ['required', 'boolean'],
            'observer_name' => ['required', 'string', 'max:150'],
        ]);

        $patient = Patient::findOrFail($data['patient_id']);
        Gate::authorize('view', $patient);

        $event = SeizureEvent::create([
            ...$data,
            'user_id' => $request->user()->id,
            'submitted_at' => now(),
        ]);

        AuditEvent::create([
            'user_id' => $request->user()->id,
            'auditable_type' => SeizureEvent::class,
            'auditable_id' => $event->id,
            'event' => 'submitted',
            'new_values' => ['patient_id' => $event->patient_id, 'occurred_at' => $event->occurred_at],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $event->daily_report_id
            ? redirect()->route('reports.show', $event->daily_report_id)->with('success', 'Seizure event recorded.')
            : redirect()->route('dashboard')->with('success', 'Seizure event recorded.');
    }
}
