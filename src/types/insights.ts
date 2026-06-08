export interface InsightPattern {
    title: string;
    type: 'strength' | 'growth_area';
    description: string;
    aspectsInvolved: string[];
}

export interface InsightIntervention {
    title: string;
    targetAspect: string;
    priority: 'tinggi' | 'sedang' | 'pemeliharaan';
    actionStep: string;
    howToAssess: string;
}

export interface StudentInsightReport {
    studentName: string;
    visualTrendSummary: string;
    patterns: InsightPattern[];
    interventions: InsightIntervention[];
}
