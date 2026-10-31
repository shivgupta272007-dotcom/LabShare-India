import { BookingStatus, UserRole } from '../types/index.js';
export interface StateTransitionContext {
    fromStatus: BookingStatus;
    toStatus: BookingStatus;
    actorRole: UserRole;
    actorUserId: string;
    bookingSponsorId: string;
    bookingOwnerOrgId: string;
    actorOrgId: string;
    reason?: string;
}
export interface TransitionValidationResult {
    allowed: boolean;
    error?: string;
    errorHi?: string;
}
export declare function canTransition(ctx: StateTransitionContext): TransitionValidationResult;
export declare function getAvailableTransitions(currentStatus: BookingStatus, actorRole: UserRole, isSponsor: boolean, isHostManager: boolean): BookingStatus[];
//# sourceMappingURL=state-machine.d.ts.map