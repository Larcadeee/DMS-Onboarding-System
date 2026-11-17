<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'program_id',
        'status',
        'enrolled_on',
        'completed_on',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_on'  => 'date',
            'completed_on' => 'date',
        ];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}