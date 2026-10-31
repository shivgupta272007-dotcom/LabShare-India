"use strict";
// ============================================================
// LabShare – Audit Hash Chaining (Cryptographic Immutability)
// Generates and verifies SHA-256 hash chains across audit records
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_GENESIS_HASH = void 0;
exports.computeAuditHash = computeAuditHash;
exports.verifyAuditChain = verifyAuditChain;
const node_crypto_1 = require("node:crypto");
exports.AUDIT_GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
/**
 * Computes the canonical SHA-256 hash of an audit log entry
 */
function computeAuditHash(entry) {
    const canonicalPayload = JSON.stringify({
        seq: entry.sequence.toString(),
        act: entry.actorId || '',
        rol: entry.actorRole || '',
        op: entry.action,
        typ: entry.entityType,
        eid: entry.entityId || '',
        oid: entry.organizationId || '',
        bef: entry.before ? JSON.stringify(entry.before) : '',
        aft: entry.after ? JSON.stringify(entry.after) : '',
        ip: entry.ip || '',
        ua: entry.userAgent || '',
        rid: entry.requestId || '',
        prev: entry.prevHash,
        ts: entry.createdAt,
    });
    return (0, node_crypto_1.createHash)('sha256').update(canonicalPayload).digest('hex');
}
/**
 * Verifies an entire sequence of audit log entries from genesis to current
 */
function verifyAuditChain(entries) {
    if (entries.length === 0) {
        return { isValid: true, totalEntries: 0 };
    }
    // Sort by sequence ascending
    const sorted = [...entries].sort((a, b) => Number(a.sequence) - Number(b.sequence));
    let expectedPrevHash = exports.AUDIT_GENESIS_HASH;
    for (let i = 0; i < sorted.length; i++) {
        const entry = sorted[i];
        const seq = Number(entry.sequence);
        // Genesis check
        if (i === 0 && entry.prevHash !== exports.AUDIT_GENESIS_HASH && entry.prevHash !== '') {
            // In segmented slices, we verify chain links
            expectedPrevHash = entry.prevHash;
        }
        if (entry.prevHash !== expectedPrevHash) {
            return {
                isValid: false,
                totalEntries: entries.length,
                brokenAtSequence: seq,
                expectedHash: expectedPrevHash,
                actualHash: entry.prevHash,
                error: `Broken link at sequence ${seq}: prevHash mismatch. Expected ${expectedPrevHash}, found ${entry.prevHash}`,
            };
        }
        const recomputedHash = computeAuditHash({
            sequence: entry.sequence,
            actorId: entry.actorId,
            actorRole: entry.actorRole,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            organizationId: entry.organizationId,
            before: entry.before,
            after: entry.after,
            ip: entry.ip,
            userAgent: entry.userAgent,
            requestId: entry.requestId,
            prevHash: entry.prevHash,
            createdAt: entry.createdAt,
        });
        if (entry.hash !== recomputedHash) {
            return {
                isValid: false,
                totalEntries: entries.length,
                brokenAtSequence: seq,
                expectedHash: recomputedHash,
                actualHash: entry.hash,
                error: `Tampered record at sequence ${seq}: hash mismatch. Expected ${recomputedHash}, stored ${entry.hash}`,
            };
        }
        expectedPrevHash = entry.hash;
    }
    return {
        isValid: true,
        totalEntries: entries.length,
    };
}
//# sourceMappingURL=audit-chain.js.map