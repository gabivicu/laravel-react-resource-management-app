<?php

namespace App\Domains\Resource\Models;

use App\Core\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Database\Factories\ResourceAllocationFactory;

/**
 * Resource Allocation Model
 * 
 * Represents the allocation of a user (resource) to a project
 */
class ResourceAllocation extends Model
{
    use HasFactory, HasTenantScope;

    protected $fillable = [
        'organization_id',
        'project_id',
        'user_id',
        'role',
        'allocation_percentage', // 0-100
        'start_date',
        'end_date',
        'notes',
    ];

    protected $casts = [
        'allocation_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return ResourceAllocationFactory::new();
    }

    /**
     * Project for which the resource is allocated
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Project\Models\Project::class);
    }

    /**
     * Allocated user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\User\Models\User::class);
    }

    /**
     * Scope for active allocations (within current time period)
     */
    public function scopeActive($query)
    {
        $now = now();
        return $query->where('start_date', '<=', $now)
                    ->where(function ($q) use ($now) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', $now);
                    });
    }
}
