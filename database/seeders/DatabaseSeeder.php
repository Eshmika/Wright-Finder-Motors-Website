<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed images from database/data/images to storage/app/public/images
        $sourceImagesPath = database_path('data/images');
        $targetImagesPath = storage_path('app/public/images');

        if (File::isDirectory($sourceImagesPath)) {
            File::ensureDirectoryExists($targetImagesPath);
            File::copyDirectory($sourceImagesPath, $targetImagesPath);
        }

        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'wrightfindermotors@gmail.com'],
            [
                'name' => 'Wright Finder Motors',
                'password' => bcrypt('Wright@1234'),
            ]
        );
        User::firstOrCreate(
            ['email' => 'eshmika2020@gmail.com'],
            [
                'name' => 'Eshmika Hettiarachchi',
                'password' => bcrypt('Eshmika@1234'),
            ]
        );
    }
}
