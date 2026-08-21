<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Patient $patient): bool
    {
        if ($user->isManager()) {
            return true;
        }

        return $patient->users()
            ->whereKey($user->id)
            ->wherePivot('starts_on', '<=', today())
            ->where(function ($query) {
                $query->whereNull('patient_user_assignments.ends_on')
                    ->orWhere('patient_user_assignments.ends_on', '>=', today());
            })
            ->exists();
    }
}
