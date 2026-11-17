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
        Schema::create('assessments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
    $table->string('title', 200);
    $table->string('type', 30)->default('quiz'); // quiz, practical, written, oral
    $table->decimal('max_score', 5, 2)->default(100);
    $table->decimal('passing_score', 5, 2)->default(75);
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
