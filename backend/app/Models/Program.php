<?php

namespace App\Models;
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'department_id',
        'title',
        'code',
        'description',
        'total_hours',
        'status',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'total_hours' => 'integer',
            'start_date'  => 'date',
            'end_date'    => 'date',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }

    public function competencies(): HasMany
    {
        return $this->hasMany(Competency::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(ProgramEnrollment::class);
    }

    public function trainees(): BelongsToMany
    {
        return $this->belongsToMany(Trainee::class, 'program_enrollments')
            ->withPivot(['status', 'enrolled_on', 'completed_on'])
            ->withTimestamps();
    }
}