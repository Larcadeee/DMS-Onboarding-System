<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('schedules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
    $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
    $table->dateTime('starts_at');
    $table->dateTime('ends_at');
    $table->string('location', 200)->nullable();
    $table->string('status', 30)->default('scheduled')->index(); // scheduled, ongoing, done, cancelled
    $table->timestamps();

    $table->index(['starts_at', 'ends_at']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
