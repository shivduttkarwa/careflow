<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Participant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'home_id', 'first_name', 'last_name', 'preferred_name', 'date_of_birth',
        'status', 'support_summary', 'accent_colour',
    ];

    protected $appends = ['display_name', 'initials'];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date'];
    }

    public function home(): BelongsTo
    {
        return $this->belongsTo(Home::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'participant_user_assignments')
            ->withPivot(['starts_on', 'ends_on'])
            ->withTimestamps();
    }

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    public function dailyReports(): HasMany
    {
        return $this->hasMany(DailyReport::class);
    }

    public function seizureEvents(): HasMany
    {
        return $this->hasMany(SeizureEvent::class);
    }

    /**
     * Managers see every participant. Support workers see only the participants whose
     * assignment is open today.
     *
     * @param  Builder<Participant>  $query
     */
    #[Scope]
    protected function visibleTo(Builder $query, User $user): void
    {
        if ($user->isManager()) {
            return;
        }

        $query->whereHas('users', fn ($assignment) => self::constrainToOpenAssignment($assignment, $user));
    }

    /**
     * Constrain a query on the assignment pivot to the rows that are open today.
     */
    public static function constrainToOpenAssignment(Builder $query, User $user): void
    {
        $query->where('users.id', $user->id)
            ->where('participant_user_assignments.starts_on', '<=', today())
            ->where(function ($dates) {
                $dates->whereNull('participant_user_assignments.ends_on')
                    ->orWhere('participant_user_assignments.ends_on', '>=', today());
            });
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->preferred_name ?: $this->first_name;
    }

    public function getInitialsAttribute(): string
    {
        return mb_strtoupper(mb_substr($this->first_name, 0, 1).mb_substr($this->last_name, 0, 1));
    }
}
