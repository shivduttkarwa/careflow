<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeizureEvent extends Model
{
    protected $fillable = [
        'participant_id', 'daily_report_id', 'user_id', 'occurred_at', 'awareness',
        'facial_expressions', 'body_movements', 'automatic_movements', 'speech',
        'fell', 'fall_notes', 'after_effects', 'seizure_duration_seconds',
        'recovery_duration_minutes', 'incontinence', 'injured', 'injury_notes',
        'qas_called', 'incident_report_completed', 'observer_name', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'awareness' => 'array',
            'facial_expressions' => 'array',
            'body_movements' => 'array',
            'automatic_movements' => 'array',
            'speech' => 'array',
            'after_effects' => 'array',
            'fell' => 'boolean',
            'injured' => 'boolean',
            'qas_called' => 'boolean',
            'incident_report_completed' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function dailyReport(): BelongsTo
    {
        return $this->belongsTo(DailyReport::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
