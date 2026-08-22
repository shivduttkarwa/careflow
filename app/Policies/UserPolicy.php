<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isManager();
    }

    public function create(User $user): bool
    {
        return $user->isManager();
    }

    public function assignParticipants(User $user, User $member): bool
    {
        return $user->isManager() && ! $member->isManager();
    }
}
