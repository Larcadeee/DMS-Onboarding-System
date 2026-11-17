<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
        ]);

        // Demo training content for local development only.
        if (app()->environment(['local', 'development', 'testing'])) {
            $this->call(DemoContentSeeder::class);
        }
    }
}
