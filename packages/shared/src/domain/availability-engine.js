"use strict";
// ============================================================
// LabShare – Availability Engine (Pure Domain Function)
// Computes open time windows:
// Free Slots = Rule Windows - Blackouts - Confirmed Bookings - Buffer
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAvailability = computeAvailability;
function computeAvailability(input) {
    const { labId, date, rules, blackouts, confirmedBookings, bufferMinutes = 15, slotDurationMinutes = 60, } = input;
    // 1. Check for Blackout Dates
    const matchedBlackout = blackouts.find((b) => {
        const bDate = typeof b.date === 'string' ? b.date.substring(0, 10) : new Date(b.date).toISOString().substring(0, 10);
        return bDate === date;
    });
    if (matchedBlackout) {
        return {
            labId,
            date,
            slots: [],
            isBlackout: true,
            blackoutReason: matchedBlackout.reason || 'Lab is closed on this date (reserved by host school)',
        };
    }
    // 2. Check Allowed Day of Week
    const targetDate = new Date(`${date}T00:00:00Z`);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayOfWeek = days[targetDate.getUTCDay()];
    if (!rules.allowedDays.includes(dayOfWeek)) {
        return {
            labId,
            date,
            slots: [],
            isBlackout: false,
            blackoutReason: `Lab is closed on ${dayOfWeek}. Operating days: ${rules.allowedDays.join(', ')}`,
        };
    }
    // 3. Parse Operating Window
    const [startHour, startMin] = rules.allowedStartTime.split(':').map(Number);
    const [endHour, endMin] = rules.allowedEndTime.split(':').map(Number);
    const dayStartMinutes = startHour * 60 + startMin;
    const dayEndMinutes = endHour * 60 + endMin;
    // 4. Normalize Confirmed Booking Intervals (including PENDING_MANAGER & APPROVED)
    const busyIntervals = [];
    for (const b of confirmedBookings) {
        const sDate = new Date(b.startTime);
        const eDate = new Date(b.endTime);
        // Convert to minute of day in local day context
        const bStartMins = sDate.getUTCHours() * 60 + sDate.getUTCMinutes();
        const bEndMins = eDate.getUTCHours() * 60 + eDate.getUTCMinutes();
        // Add buffer
        busyIntervals.push({
            start: Math.max(0, bStartMins - bufferMinutes),
            end: bEndMins + bufferMinutes,
            id: b.id,
        });
    }
    // 5. Generate Candidate Slots
    const slots = [];
    const step = Math.max(30, slotDurationMinutes);
    for (let m = dayStartMinutes; m + rules.minDurationMinutes <= dayEndMinutes; m += step) {
        const slotStartMin = m;
        const slotEndMin = m + slotDurationMinutes;
        if (slotEndMin > dayEndMinutes)
            break;
        // Format ISO strings
        const formatTime = (mins) => {
            const h = Math.floor(mins / 60);
            const min = mins % 60;
            return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        };
        const startIso = `${date}T${formatTime(slotStartMin)}:00.000Z`;
        const endIso = `${date}T${formatTime(slotEndMin)}:00.000Z`;
        // Overlap check
        const isConflict = busyIntervals.some((b) => {
            return Math.max(slotStartMin, b.start) < Math.min(slotEndMin, b.end);
        });
        slots.push({
            startTime: startIso,
            endTime: endIso,
            durationMinutes: slotDurationMinutes,
            isAvailable: !isConflict,
            reason: isConflict ? 'Conflicting booking or buffer interval' : undefined,
        });
    }
    return {
        labId,
        date,
        slots,
        isBlackout: false,
    };
}
//# sourceMappingURL=availability-engine.js.map