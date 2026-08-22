<?php

namespace App\Policies;

use App\Models\Participant;
use App\Models\User;

class ParticipantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Participant $participant): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $participant->users()
            ->whereKey($user->id)
            ->wherePivot('starts_on', '<=', today())
            ->where(function ($query) {
                $query->whereNull('participant_user_assignments.ends_on')
                    ->orWhere('participant_user_assignments.ends_on', '>=', today());
            })
            ->exists();
    }
}
