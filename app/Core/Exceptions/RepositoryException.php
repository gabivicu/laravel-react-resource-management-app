<?php

namespace App\Core\Exceptions;

use Exception;

/**
 * Exception for errors in Repository layer
 */
class RepositoryException extends Exception
{
    public static function modelNotFound(string $model, $id): self
    {
        return new self("{$model} with ID {$id} not found.");
    }

    public static function createFailed(string $model, string $reason = ''): self
    {
        $message = "Failed to create {$model}.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        return new self($message);
    }

    public static function updateFailed(string $model, $id, string $reason = ''): self
    {
        $message = "Failed to update {$model} with ID {$id}.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        return new self($message);
    }
}
