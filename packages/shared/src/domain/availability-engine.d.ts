import { AvailabilityResponse, BlackoutDate, LabRules } from '../types/index.js';
export interface ComputeAvailabilityInput {
    labId: string;
    date: string;
    rules: LabRules;
    blackouts: BlackoutDate[];
    confirmedBookings: Array<{
        id: string;
        startTime: string | Date;
        endTime: string | Date;
        status: string;
    }>;
    bufferMinutes?: number;
    slotDurationMinutes?: number;
}
export declare function computeAvailability(input: ComputeAvailabilityInput): AvailabilityResponse;
//# sourceMappingURL=availability-engine.d.ts.map