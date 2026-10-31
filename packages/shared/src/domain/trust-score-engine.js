"use strict";
// ============================================================
// LabShare – Trust Score Engine (Pure Domain Function)
// Documented, transparent, event-driven formula
// Computes 0-100 score + granular breakdown in EN and HI
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTrustScore = computeTrustScore;
const index_js_1 = require("../constants/index.js");
function computeTrustScore(input) {
    const { organizationId, completedBookings, onTimeCheckIns, totalCheckIns, incidentCount, averageRating, ratingCount, disputesLost, noShows, accountAgeMonths, } = input;
    // 1. Completed Bookings Score (Max 25 pts)
    // Reaches full 25 points at 20 completed bookings
    const completedBookingsScore = Math.min(index_js_1.TRUST_SCORE_WEIGHTS.completedBookings, (completedBookings / 20) * index_js_1.TRUST_SCORE_WEIGHTS.completedBookings);
    // 2. On-Time Check-in Rate (Max 20 pts)
    const onTimeRate = totalCheckIns > 0 ? (onTimeCheckIns / totalCheckIns) * 100 : 100;
    const onTimeScore = (onTimeRate / 100) * index_js_1.TRUST_SCORE_WEIGHTS.onTimeRate;
    // 3. Zero Incident Rate (Max 20 pts)
    // Deduct 5 points per incident
    const incidentDeduction = incidentCount * 5;
    const incidentScore = Math.max(0, index_js_1.TRUST_SCORE_WEIGHTS.zeroIncidentRate - incidentDeduction);
    const zeroIncidentRate = completedBookings > 0
        ? Math.max(0, 100 - (incidentCount / completedBookings) * 100)
        : 100;
    // 4. Host Ratings (Max 15 pts)
    // If no ratings yet, baseline neutral is 10/15
    let ratingScore = 10;
    if (ratingCount > 0) {
        ratingScore = (Math.max(1, Math.min(5, averageRating)) / 5) * index_js_1.TRUST_SCORE_WEIGHTS.averageRating;
    }
    // 5. Disputes Decided Against Org (Max 10 pts)
    // Deduct 5 points per lost dispute
    const disputeScore = Math.max(0, index_js_1.TRUST_SCORE_WEIGHTS.noDisputesLost - disputesLost * 5);
    // 6. No-Shows (Max 5 pts)
    // Deduct 2.5 points per no-show
    const noShowScore = Math.max(0, index_js_1.TRUST_SCORE_WEIGHTS.noNoShows - noShows * 2.5);
    // 7. Account Age Stability (Max 5 pts)
    // 1 point per 2 months up to 10 months
    const ageScore = Math.min(index_js_1.TRUST_SCORE_WEIGHTS.accountAge, (accountAgeMonths / 10) * index_js_1.TRUST_SCORE_WEIGHTS.accountAge);
    // Total Score (0-100)
    const rawTotal = completedBookingsScore +
        onTimeScore +
        incidentScore +
        ratingScore +
        disputeScore +
        noShowScore +
        ageScore;
    const totalScore = Math.round(Math.min(100, Math.max(0, rawTotal)) * 10) / 10;
    const explanation = `Trust Score of ${totalScore}/100 calculated from ${completedBookings} completed sessions (${completedBookingsScore.toFixed(1)}/25), ` +
        `${onTimeRate.toFixed(0)}% on-time record (${onTimeScore.toFixed(1)}/20), ` +
        `${incidentCount} incident(s) (${incidentScore.toFixed(1)}/20), ` +
        `${ratingCount > 0 ? averageRating.toFixed(1) + '★' : 'Baseline'} rating (${ratingScore.toFixed(1)}/15), ` +
        `${disputesLost} disputes lost (${disputeScore.toFixed(1)}/10), ` +
        `and ${accountAgeMonths} months tenure (${ageScore.toFixed(1)}/5).`;
    const explanationHi = `ट्रस्ट स्कोर ${totalScore}/100: ${completedBookings} पूर्ण सत्र (${completedBookingsScore.toFixed(1)}/25), ` +
        `${onTimeRate.toFixed(0)}% समयबद्धता (${onTimeScore.toFixed(1)}/20), ` +
        `${incidentCount} घटनाएं (${incidentScore.toFixed(1)}/20), ` +
        `${averageRating > 0 ? averageRating.toFixed(1) + '★' : 'प्रारंभिक'} रेटिंग (${ratingScore.toFixed(1)}/15), ` +
        `और ${disputesLost} विवाद (${disputeScore.toFixed(1)}/10) के आधार पर निर्धारित किया गया है।`;
    const breakdown = {
        completedBookingsScore: Math.round(completedBookingsScore * 10) / 10,
        onTimeScore: Math.round(onTimeScore * 10) / 10,
        incidentScore: Math.round(incidentScore * 10) / 10,
        ratingScore: Math.round(ratingScore * 10) / 10,
        disputeScore: Math.round(disputeScore * 10) / 10,
        noShowScore: Math.round(noShowScore * 10) / 10,
        ageScore: Math.round(ageScore * 10) / 10,
        explanation,
        explanationHi,
    };
    return {
        organizationId,
        score: totalScore,
        completedBookings,
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        zeroIncidentRate: Math.round(zeroIncidentRate * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        disputesLost,
        noShows,
        accountAgeMonths,
        lastComputedAt: new Date().toISOString(),
        breakdown,
    };
}
//# sourceMappingURL=trust-score-engine.js.map