<?php

namespace App\Domains\Project\Models;

use App\Core\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Database\Factories\ProjectFactory;

/**
 * Project Model
 */
class Project extends Model
{
    use HasFactory, HasTenantScope;

    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
        'budget',
        'settings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'settings' => 'array',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return ProjectFactory::new();
    }

    /**
     * Organization that the project belongs to
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Organization\Models\Organization::class);
    }

    /**
     * Project members
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\User\Models\User::class,
            'project_members',
            'project_id',
            'user_id'
        )->withPivot(['role', 'joined_at'])
          ->withTimestamps();
    }

    /**
     * Task-urile proiectului
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(\App\Domains\Task\Models\Task::class);
    }

    /**
     * Resource allocations for the project
     */
    public function resourceAllocations(): HasMany
    {
        return $this->hasMany(\App\Domains\Resource\Models\ResourceAllocation::class);
    }
}
