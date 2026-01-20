<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
            TaskSeeder::class,
            ResourceAllocationSeeder::class,
        ]);

        $this->command->info('Database seeding completed successfully!');
        $this->command->info('You can now login with: admin@demo.com / password');
    }
}
