<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Competency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'program_id',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function trainees(): BelongsToMany
    {
        return $this->belongsToMany(Trainee::class, 'trainee_competencies')
            ->withPivot(['status', 'achieved_on', 'verified_by'])
            ->withTimestamps();
    }
}