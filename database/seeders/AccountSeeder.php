<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AccountSeeder extends Seeder
{
    public const MANAGER_EMAIL = 'manager@careflow.test';

    public const WORKER_EMAIL = 'worker@careflow.test';

    /**
     * @var list<array{string, string, string}>
     */
    public const ACCOUNTS = [
        ['Denise Whitlock', self::MANAGER_EMAIL, 'manager'],
        ['Aisha Rahman', self::WORKER_EMAIL, 'support_worker'],
        ['Tomas Alvarez', 'worker2@careflow.test', 'support_worker'],
        ['Grace Ngata', 'worker3@careflow.test', 'support_worker'],
        ['Peter Loughlin', 'worker4@careflow.test', 'support_worker'],
        ['Mei Chen', 'worker5@careflow.test', 'support_worker'],
        ['Jared Okonkwo', 'worker6@careflow.test', 'support_worker'],
    ];

    public function run(): void
    {
        foreach (self::ACCOUNTS as [$name, $email, $role]) {
            $user = User::firstOrNew(['email' => $email]);

            if ($user->exists) {
                continue;
            }

            $user->forceFill([
                'name' => $name,
                'role' => $role,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ])->save();
        }
    }
}
