<?php

namespace App\Core\Exceptions;

use Exception;

/**
 * Exception for multi-tenancy related errors
 */
class TenantException extends Exception
{
    public static function tenantNotSet(): self
    {
        return new self('Tenant (organization) is not set. Please provide X-Tenant-ID header or organization_id parameter.');
    }

    public static function tenantNotFound(int $tenantId): self
    {
        return new self("Tenant with ID {$tenantId} not found.");
    }

    public static function unauthorizedTenantAccess(int $tenantId): self
    {
        return new self("Unauthorized access to tenant with ID {$tenantId}.");
    }
}
