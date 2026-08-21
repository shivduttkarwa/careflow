<?php

namespace App\Policies;

use App\Models\DailyReport;
use App\Models\Patient;
use App\Models\User;

class DailyReportPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DailyReport $dailyReport): bool
    {
        return $user->can('view', $dailyReport->patient);
    }

    public function create(User $user, Patient $patient): bool
    {
        return $user->can('view', $patient);
    }

    public function update(User $user, DailyReport $dailyReport): bool
    {
        if ($dailyReport->status !== 'draft') {
            return false;
        }

        return $user->isManager()
            || ($dailyReport->user_id === $user->id && $user->can('view', $dailyReport->patient));
    }
}
