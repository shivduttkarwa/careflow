<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the demonstration environment. For a real deployment run
     * AccountSeeder on its own so no sample care data is created.
     */
    public function run(): void
    {
        $this->call([
            AccountSeeder::class,
            DemoCareSeeder::class,
        ]);
    }
}
