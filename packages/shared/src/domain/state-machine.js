"use strict";
// ============================================================
// LabShare – Booking State Machine
// Pure domain transition module with role permissions & invariants
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.getAvailableTransitions = getAvailableTransitions;
const index_js_1 = require("../constants/index.js");
/**
 * Role permissions allowed for each specific transition
 */
const ROLE_TRANSITION_PERMISSIONS = {
    'DRAFT->SUBMITTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'ADMIN'],
        mustBeSponsor: true,
    },
    'SUBMITTED->AUTO_REJECTED': {
        allowedRoles: ['ADMIN'], // System internal
    },
    'SUBMITTED->PENDING_MANAGER': {
        allowedRoles: ['ADMIN'], // System internal
    },
    'PENDING_MANAGER->APPROVED': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'PENDING_MANAGER->REJECTED': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'PENDING_MANAGER->CHANGES_REQUESTED': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'PENDING_MANAGER->EXPIRED': {
        allowedRoles: ['ADMIN'], // System SLA worker
    },
    'CHANGES_REQUESTED->SUBMITTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'ADMIN'],
        mustBeSponsor: true,
    },
    'CHANGES_REQUESTED->CANCELLED': {
        allowedRoles: ['TEACHER_SPONSOR', 'ADMIN'],
        mustBeSponsor: true,
    },
    'APPROVED->CHECKED_IN': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'APPROVED->CANCELLED': {
        allowedRoles: ['TEACHER_SPONSOR', 'MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
    },
    'APPROVED->NO_SHOW': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'APPROVED->DISPUTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
    },
    'CHECKED_IN->COMPLETED': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'CHECKED_IN->INCIDENT_FLAGGED': {
        allowedRoles: ['MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
        mustBeOwnerOrg: true,
    },
    'CHECKED_IN->DISPUTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
    },
    'COMPLETED->DISPUTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
    },
    'INCIDENT_FLAGGED->DISPUTED': {
        allowedRoles: ['TEACHER_SPONSOR', 'MANAGER', 'OWNER_SCHOOL', 'ADMIN'],
    },
    'INCIDENT_FLAGGED->RESOLVED': {
        allowedRoles: ['ADMIN'],
    },
    'DISPUTED->RESOLVED': {
        allowedRoles: ['ADMIN'],
    },
};
function canTransition(ctx) {
    const { fromStatus, toStatus, actorRole, actorUserId, bookingSponsorId, bookingOwnerOrgId, actorOrgId } = ctx;
    // 1. Check graph adjacency
    const validDestinations = index_js_1.BOOKING_TRANSITIONS[fromStatus] || [];
    if (!validDestinations.includes(toStatus)) {
        return {
            allowed: false,
            error: `Invalid status transition: cannot move from ${fromStatus} to ${toStatus}.`,
            errorHi: `अमान्य स्थिति परिवर्तन: ${fromStatus} से ${toStatus} में नहीं बदला जा सकता।`,
        };
    }
    // 2. Platform Admins can execute any valid graph transition
    if (actorRole === 'ADMIN') {
        return { allowed: true };
    }
    // 3. Permission checks
    const transitionKey = `${fromStatus}->${toStatus}`;
    const permission = ROLE_TRANSITION_PERMISSIONS[transitionKey];
    if (!permission) {
        return {
            allowed: false,
            error: `Transition ${transitionKey} is restricted to automated system procedures.`,
            errorHi: `यह प्रक्रिया केवल सिस्टम द्वारा संचालित की जा सकती है।`,
        };
    }
    if (!permission.allowedRoles.includes(actorRole)) {
        return {
            allowed: false,
            error: `User role '${actorRole}' is not authorized to transition booking from ${fromStatus} to ${toStatus}.`,
            errorHi: `उपयोगकर्ता भूमिका '${actorRole}' को इस स्थिति परिवर्तन का अधिकार नहीं है।`,
        };
    }
    // 4. Sponsor ownership verification
    if (permission.mustBeSponsor && actorUserId !== bookingSponsorId) {
        return {
            allowed: false,
            error: 'Only the designated Teacher Sponsor who registered the booking may perform this action.',
            errorHi: 'केवल नामांकित शिक्षक प्रायोजक ही यह कार्रवाई कर सकते हैं।',
        };
    }
    // 5. Host Lab Organization tenancy verification (Prevents IDOR)
    if (permission.mustBeOwnerOrg && actorOrgId !== bookingOwnerOrgId) {
        return {
            allowed: false,
            error: 'IDOR Prevention: Managers may only perform operations on labs belonging to their own school.',
            errorHi: 'सुरक्षा त्रुटि: प्रबंधक केवल अपने स्कूल की प्रयोगशालाओं पर कार्रवाई कर सकते हैं।',
        };
    }
    return { allowed: true };
}
function getAvailableTransitions(currentStatus, actorRole, isSponsor, isHostManager) {
    const allDestinations = index_js_1.BOOKING_TRANSITIONS[currentStatus] || [];
    if (actorRole === 'ADMIN')
        return allDestinations;
    return allDestinations.filter((targetStatus) => {
        const key = `${currentStatus}->${targetStatus}`;
        const perm = ROLE_TRANSITION_PERMISSIONS[key];
        if (!perm)
            return false;
        if (!perm.allowedRoles.includes(actorRole))
            return false;
        if (perm.mustBeSponsor && !isSponsor)
            return false;
        if (perm.mustBeOwnerOrg && !isHostManager)
            return false;
        return true;
    });
}
//# sourceMappingURL=state-machine.js.map