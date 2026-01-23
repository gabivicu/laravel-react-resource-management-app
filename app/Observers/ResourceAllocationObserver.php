<?php

namespace App\Observers;

use App\Domains\Resource\Models\ResourceAllocation;
use App\Traits\ClearsOrganizationCache;

class ResourceAllocationObserver
{
    use ClearsOrganizationCache;

    /**
     * Handle the ResourceAllocation "created" event.
     */
    public function created(ResourceAllocation $resourceAllocation): void
    {
        $this->clearOrganizationCache($resourceAllocation->organization_id);
    }

    /**
     * Handle the ResourceAllocation "updated" event.
     */
    public function updated(ResourceAllocation $resourceAllocation): void
    {
        $this->clearOrganizationCache($resourceAllocation->organization_id);
    }

    /**
     * Handle the ResourceAllocation "deleted" event.
     */
    public function deleted(ResourceAllocation $resourceAllocation): void
    {
        $this->clearOrganizationCache($resourceAllocation->organization_id);
    }
}
