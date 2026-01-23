<?php

namespace App\Jobs;

use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessProjectCreation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Project $project
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("Starting background process for project: {$this->project->name}");

        // Simulate heavy processing (e.g. sending emails to all organization members)
        // In a real scenario, we would use Mail::to($members)->queue(...)
        $membersCount = User::where('current_organization_id', $this->project->organization_id)->count();

        Log::info("Sending notifications to {$membersCount} members...");

        // Simulate delay to prove it's async (if queue driver is not sync)
        sleep(2);

        Log::info("Project creation processing completed for: {$this->project->name}");
    }
}
