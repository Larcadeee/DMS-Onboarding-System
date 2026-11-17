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
       Schema::create('trainee_competencies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('trainee_id')->constrained('trainees')->cascadeOnDelete();
    $table->foreignId('competency_id')->constrained('competencies')->cascadeOnDelete();
    $table->string('status', 30)->default('not_started'); // not_started, in_progress, competent, not_yet_competent
    $table->date('achieved_on')->nullable();
    $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();

    $table->unique(['trainee_id', 'competency_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainee_competencies');
    }
};
