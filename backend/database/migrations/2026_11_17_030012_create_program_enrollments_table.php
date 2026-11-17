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
        Schema::create('program_enrollments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('trainee_id')->constrained('trainees')->cascadeOnDelete();
    $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
    $table->string('status', 30)->default('enrolled')->index(); // enrolled, in_progress, completed, dropped
    $table->date('enrolled_on');
    $table->date('completed_on')->nullable();
    $table->timestamps();

    $table->unique(['trainee_id', 'program_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_enrollments');
    }
};
