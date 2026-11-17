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
        Schema::create('trainees', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->unique()
        ->constrained('users')->nullOnDelete();       // trainee may have a login
    $table->string('trainee_number', 30)->unique();
    $table->string('first_name', 100);
    $table->string('last_name', 100);
    $table->string('middle_name', 100)->nullable();
    $table->string('email', 255)->nullable()->index();
    $table->string('phone', 30)->nullable();
    $table->date('date_of_birth')->nullable();
    $table->string('gender', 20)->nullable();
    $table->string('address')->nullable();
    $table->string('barangay', 100)->nullable();
    $table->string('status', 30)->default('active')->index(); // active, inactive, completed, withdrawn
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainees');
    }
};
