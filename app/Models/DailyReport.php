<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyReport extends Model
{
    protected $fillable = [
        'patient_id', 'shift_id', 'user_id', 'report_date', 'shift_type', 'status',
        'shower_taken', 'bed_bath', 'personal_care_notes', 'physio_completed',
        'breakfast', 'lunch', 'dinner', 'snacks', 'fluids_ml', 'fluids_notes', 'food_notes',
        'bowel_opened', 'bowel_texture', 'bowel_notes', 'urine_status', 'urine_notes',
        'sleep_from', 'sleep_to', 'overnight_observations', 'overnight_attendance',
        'follow_up_required', 'handover_notes', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date',
            'shower_taken' => 'boolean',
            'bed_bath' => 'boolean',
            'physio_completed' => 'boolean',
            'bowel_opened' => 'boolean',
            'follow_up_required' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function seizureEvents(): HasMany
    {
        return $this->hasMany(SeizureEvent::class);
    }
}
