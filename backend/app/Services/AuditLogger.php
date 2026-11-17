<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Central helper for writing audit trail entries.
 *
 * Every important action (authentication events, future CRUD
 * operations, administrative changes) should pass through here so
 * audit records stay consistent in shape and content.
 */
class AuditLogger
{
    /**
     * Record an audited action.
     *
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public static function log(
        string $action,
        ?User $user = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Model $auditable = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => $auditable?->getMorphClass(),
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()?->ip(),
        ]);
    }
}
