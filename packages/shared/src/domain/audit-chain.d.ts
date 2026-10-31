import { AuditAction, AuditLog, UserRole } from '../types/index.js';
export declare const AUDIT_GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
export interface CreateAuditEntryInput {
    sequence: number;
    actorId?: string;
    actorRole?: UserRole;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    organizationId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    requestId?: string;
    prevHash: string;
    createdAt?: string;
}
/**
 * Computes the canonical SHA-256 hash of an audit log entry
 */
export declare function computeAuditHash(entry: {
    sequence: number | bigint;
    actorId?: string;
    actorRole?: string;
    action: string;
    entityType: string;
    entityId?: string;
    organizationId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    requestId?: string;
    prevHash: string;
    createdAt: string;
}): string;
export interface VerificationResult {
    isValid: boolean;
    totalEntries: number;
    brokenAtSequence?: number;
    expectedHash?: string;
    actualHash?: string;
    error?: string;
}
/**
 * Verifies an entire sequence of audit log entries from genesis to current
 */
export declare function verifyAuditChain(entries: AuditLog[]): VerificationResult;
//# sourceMappingURL=audit-chain.d.ts.map