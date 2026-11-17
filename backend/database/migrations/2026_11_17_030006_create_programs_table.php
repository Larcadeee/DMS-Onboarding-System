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
        Schema::create('programs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('department_id')->nullable()
        ->constrained('departments')->nullOnDelete();
    $table->string('title', 200);
    $table->string('code', 30)->unique();
    $table->text('description')->nullable();
    $table->unsignedSmallInteger('total_hours')->default(0);
    $table->string('status', 30)->default('draft')->index(); // draft, published, archived
    $table->date('start_date')->nullable();
    $table->date('end_date')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
