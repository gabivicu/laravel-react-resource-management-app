<?php

namespace App\Domains\Task\Models;

use App\Core\Traits\HasTenantScope;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Task Model
 */
class Task extends Model
{
    use HasFactory, HasTenantScope;

    protected $fillable = [
        'organization_id',
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'estimated_hours',
        'actual_hours',
        'order', // For sorting in Kanban board
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'order' => 'integer',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return TaskFactory::new();
    }

    /**
     * Project that the task belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Project\Models\Project::class);
    }

    /**
     * Users assigned to the task
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\User\Models\User::class,
            'task_assignees',
            'task_id',
            'user_id'
        )->withTimestamps();
    }

    /**
     * Scope for tasks by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for high priority tasks
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'high');
    }
}
