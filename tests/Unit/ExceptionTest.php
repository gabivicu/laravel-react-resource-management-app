<?php

namespace Tests\Unit;

use App\Core\Exceptions\RepositoryException;
use App\Core\Exceptions\TenantException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ExceptionTest extends TestCase
{
    #[Test]
    public function repository_exception_model_not_found_has_correct_message()
    {
        $exception = RepositoryException::modelNotFound('Project', 123);

        $this->assertInstanceOf(RepositoryException::class, $exception);
        $this->assertEquals('Project with ID 123 not found.', $exception->getMessage());
    }

    #[Test]
    public function repository_exception_create_failed_has_correct_message()
    {
        $exception = RepositoryException::createFailed('Project');

        $this->assertInstanceOf(RepositoryException::class, $exception);
        $this->assertEquals('Failed to create Project.', $exception->getMessage());
    }

    #[Test]
    public function repository_exception_create_failed_includes_reason()
    {
        $exception = RepositoryException::createFailed('Project', 'Database error');

        $this->assertInstanceOf(RepositoryException::class, $exception);
        $this->assertEquals('Failed to create Project. Reason: Database error', $exception->getMessage());
    }

    #[Test]
    public function repository_exception_update_failed_has_correct_message()
    {
        $exception = RepositoryException::updateFailed('Project', 123);

        $this->assertInstanceOf(RepositoryException::class, $exception);
        $this->assertEquals('Failed to update Project with ID 123.', $exception->getMessage());
    }

    #[Test]
    public function repository_exception_update_failed_includes_reason()
    {
        $exception = RepositoryException::updateFailed('Project', 123, 'Validation failed');

        $this->assertInstanceOf(RepositoryException::class, $exception);
        $this->assertEquals('Failed to update Project with ID 123. Reason: Validation failed', $exception->getMessage());
    }

    #[Test]
    public function tenant_exception_tenant_not_set_has_correct_message()
    {
        $exception = TenantException::tenantNotSet();

        $this->assertInstanceOf(TenantException::class, $exception);
        $this->assertEquals('Tenant (organization) is not set. Please provide X-Tenant-ID header or organization_id parameter.', $exception->getMessage());
    }

    #[Test]
    public function tenant_exception_tenant_not_found_has_correct_message()
    {
        $exception = TenantException::tenantNotFound(123);

        $this->assertInstanceOf(TenantException::class, $exception);
        $this->assertEquals('Tenant with ID 123 not found.', $exception->getMessage());
    }

    #[Test]
    public function tenant_exception_unauthorized_tenant_access_has_correct_message()
    {
        $exception = TenantException::unauthorizedTenantAccess(123);

        $this->assertInstanceOf(TenantException::class, $exception);
        $this->assertEquals('Unauthorized access to tenant with ID 123.', $exception->getMessage());
    }
}
