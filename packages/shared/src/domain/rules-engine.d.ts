import { Lab, LabRules, Organization, RulesEvaluationResult, StudentGroup, User } from '../types/index.js';
export interface RulesEvaluationInput {
    request: {
        startTime: string;
        endTime: string;
        date: string;
        headcount: number;
        equipmentRequested: string[];
    };
    lab: Lab;
    rules: LabRules;
    group: StudentGroup;
    sponsor: User;
    organization: Organization;
    orgMonthlyBookingCount?: number;
    isBlackoutDate?: boolean;
}
export declare function evaluateRules(input: RulesEvaluationInput): RulesEvaluationResult;
//# sourceMappingURL=rules-engine.d.ts.map