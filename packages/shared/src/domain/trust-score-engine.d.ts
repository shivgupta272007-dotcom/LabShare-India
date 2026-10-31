import { TrustScore } from '../types/index.js';
export interface TrustScoreMetricsInput {
    organizationId: string;
    completedBookings: number;
    onTimeCheckIns: number;
    totalCheckIns: number;
    incidentCount: number;
    averageRating: number;
    ratingCount: number;
    disputesLost: number;
    noShows: number;
    accountAgeMonths: number;
}
export declare function computeTrustScore(input: TrustScoreMetricsInput): TrustScore;
//# sourceMappingURL=trust-score-engine.d.ts.map