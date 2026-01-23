<?php

namespace Database\Seeders;

use App\Domains\User\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@demo.com')->first();
        if ($user) {
            $user->is_super_admin = true;
            $user->save();
            $this->command->info('User admin@demo.com is now a Super Admin.');
        } else {
            $this->command->warn('User admin@demo.com not found.');
        }
    }
}
