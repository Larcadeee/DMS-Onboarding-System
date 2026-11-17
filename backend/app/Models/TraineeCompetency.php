<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TraineeCompetency extends Model
{
    use HasFactory;

    protected $table = 'trainee_competencies';

    protected $fillable = [
        'trainee_id',
        'competency_id',
        'status',
        'achieved_on',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'achieved_on' => 'date',
        ];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}