export declare const APP_NAME = "LabShare";
export declare const APP_NAME_HI = "\u0932\u0948\u092C\u0936\u0947\u092F\u0930";
export declare const APP_TAGLINE = "Connecting idle school labs with communities that need them";
export declare const APP_TAGLINE_HI = "\u0916\u093E\u0932\u0940 \u0938\u094D\u0915\u0942\u0932 \u0932\u0948\u092C \u0915\u094B \u091C\u0930\u0942\u0930\u0924\u092E\u0902\u0926 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0938\u0947 \u091C\u094B\u0921\u093C\u0928\u093E";
export declare const IST_OFFSET_MINUTES = 330;
import { BookingStatus } from '../types/index.js';
export declare const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]>;
export declare const TRUST_SCORE_WEIGHTS: {
    readonly completedBookings: 25;
    readonly onTimeRate: 20;
    readonly zeroIncidentRate: 20;
    readonly averageRating: 15;
    readonly noDisputesLost: 10;
    readonly noNoShows: 5;
    readonly accountAge: 5;
};
export declare const TRUST_SCORE_AUTO_APPROVE_THRESHOLD = 80;
export declare const BOOKING_SLA_HOURS = 48;
export declare const OTP_EXPIRY_MINUTES = 10;
export declare const OTP_MAX_ATTEMPTS = 3;
export declare const OTP_BRUTE_FORCE_LOCKOUT_MINUTES = 30;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const MAX_PHOTO_SIZE_MB = 5;
export declare const MAX_DOC_SIZE_MB = 10;
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const ALLOWED_DOC_TYPES: string[];
export declare const LAB_HOUR_VALUE_INR: Record<string, number>;
export declare const DEFAULT_SUPERVISION_ADULTS = 1;
export declare const DEFAULT_SUPERVISION_STUDENTS = 15;
export declare const CHECKIN_WINDOW_BEFORE_MINUTES = 15;
export declare const CHECKIN_WINDOW_AFTER_MINUTES = 30;
export declare const DEMO_MODE_ENV = "DEMO_MODE";
export declare const DEMO_ACCOUNTS: readonly [{
    readonly phone: "9000000001";
    readonly role: "ADMIN";
    readonly name: "Admin User";
}, {
    readonly phone: "9000000002";
    readonly role: "OWNER_SCHOOL";
    readonly name: "Navodaya Owner";
    readonly org: "Navodaya Vidyalaya Jhansi";
}, {
    readonly phone: "9000000003";
    readonly role: "MANAGER";
    readonly name: "Lab Manager";
    readonly org: "Navodaya Vidyalaya Jhansi";
}, {
    readonly phone: "9000000004";
    readonly role: "OWNER_SCHOOL";
    readonly name: "DPS Owner";
    readonly org: "Delhi Public School Jhansi";
}, {
    readonly phone: "9000000005";
    readonly role: "TEACHER_SPONSOR";
    readonly name: "NGO Sponsor";
    readonly org: "Bundelkhand Shiksha Samiti";
}, {
    readonly phone: "9000000006";
    readonly role: "TEACHER_SPONSOR";
    readonly name: "Coaching Sponsor";
    readonly org: "Asha Coaching Centre";
}];
export declare const DEMO_OTP = "123456";
export declare const BUNDELKHAND_DISTRICTS: string[];
export declare const INDIAN_STATES: string[];
export * from './seed-data.js';
//# sourceMappingURL=index.d.ts.map