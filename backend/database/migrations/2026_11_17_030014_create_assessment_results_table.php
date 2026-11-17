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
        Schema::create('assessment_results', function (Blueprint $table) {
    $table->id();
    $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
    $table->foreignId('trainee_id')->constrained('trainees')->cascadeOnDelete();
    $table->decimal('score', 5, 2)->nullable();
    $table->string('result', 20)->default('pending'); // pending, passed, failed
    $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('graded_at')->nullable();
    $table->timestamps();

    $table->unique(['assessment_id', 'trainee_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
    }
};
