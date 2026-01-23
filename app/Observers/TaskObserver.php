<?php

namespace App\Observers;

use App\Domains\Task\Models\Task;
use App\Traits\ClearsOrganizationCache;

class TaskObserver
{
    use ClearsOrganizationCache;

    /**
     * Handle events after all transactions are committed.
     *
     * @var bool
     */
    public $afterCommit = true;

    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $this->clearOrganizationCache($task->organization_id);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        $this->clearOrganizationCache($task->organization_id);
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        $this->clearOrganizationCache($task->organization_id);
    }
}
