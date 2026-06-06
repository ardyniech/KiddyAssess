export interface Event {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    category: 'Academic' | 'Holiday' | 'Event' | 'Holiday Staff' | 'Assessment' | 'Meeting';
    description: string;
}

export interface ConflictReport {
    status: 'aman' | 'peringatan' | 'konflik';
    reason: string;
    recommendation: string;
}
