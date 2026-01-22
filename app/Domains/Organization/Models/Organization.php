<?php

namespace App\Domains\Organization\Models;

use Database\Factories\OrganizationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Organization Model (Tenants)
 *
 * Each organization represents a tenant in the multi-tenant system
 */
class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return OrganizationFactory::new();
    }

    /**
     * Users that belong to this organization
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\User\Models\User::class,
            'organization_user',
            'organization_id',
            'user_id'
        )->withPivot(['role_id', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Projects of the organization
     */
    public function projects(): HasMany
    {
        return $this->hasMany(\App\Domains\Project\Models\Project::class);
    }

    /**
     * Scope for active organizations
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching by slug
     */
    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }
}
