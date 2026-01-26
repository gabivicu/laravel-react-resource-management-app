<?php

namespace App\Domains\Permission\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Permission Model
 *
 * Permissions define specific actions (e.g., projects.create, tasks.delete)
 */
class Permission extends Model
{
    use HasFactory;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return PermissionFactory::new();
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'group', // Group for organization (e.g., 'projects', 'tasks', 'users')
    ];

    /**
     * Roles that have this permission
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'role_permission',
            'permission_id',
            'role_id'
        )->withTimestamps();
    }

    /**
     * Scope for permissions in a specific group
     */
    public function scopeInGroup($query, string $group)
    {
        return $query->where('group', $group);
    }
}
