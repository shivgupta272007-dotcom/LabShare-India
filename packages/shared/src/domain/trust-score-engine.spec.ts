import { describe, it } from 'node:test'
import assert from 'node:assert'
import { computeTrustScore } from './trust-score-engine.js'

describe('Trust Score Engine (computeTrustScore)', () => {
  it('computes realistic score for high-performing veteran school', () => {
    const score = computeTrustScore({
      organizationId: 'org-test-1',
      completedBookings: 25,
      onTimeCheckIns: 24,
      totalCheckIns: 25,
      incidentCount: 0,
      averageRating: 4.8,
      ratingCount: 15,
      disputesLost: 0,
      noShows: 0,
      accountAgeMonths: 12,
    })

    assert(score.score >= 90)
    assert.strictEqual(score.disputesLost, 0)
    assert.strictEqual(score.zeroIncidentRate, 100)
    assert(score.breakdown.explanation.includes('Trust Score of'))
  })

  it('penalizes organizations for incidents, disputes lost, and no-shows', () => {
    const score = computeTrustScore({
      organizationId: 'org-test-bad',
      completedBookings: 4,
      onTimeCheckIns: 2,
      totalCheckIns: 4,
      incidentCount: 2, // -10 pts
      averageRating: 2.5,
      ratingCount: 3,
      disputesLost: 1, // -5 pts
      noShows: 1, // -2.5 pts
      accountAgeMonths: 2,
    })

    assert(score.score < 55)
    assert(score.breakdown.incidentScore < 15)
    assert(score.breakdown.disputeScore < 10)
  })
})
