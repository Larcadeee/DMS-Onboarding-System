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
        Schema::create('modules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
    $table->string('title', 200);
    $table->text('description')->nullable();
    $table->unsignedSmallInteger('sequence')->default(1);
    $table->unsignedSmallInteger('duration_hours')->default(0);
    $table->timestamps();
    $table->softDeletes();

    $table->unique(['program_id', 'sequence']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
