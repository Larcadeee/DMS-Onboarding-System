<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id',
        'title',
        'type',
        'max_score',
        'passing_score',
    ];

    protected function casts(): array
    {
        return [
            'max_score'     => 'decimal:2',
            'passing_score' => 'decimal:2',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class)->withTrashed();
    }

    public function results(): HasMany
    {
        return $this->hasMany(AssessmentResult::class);
    }
}