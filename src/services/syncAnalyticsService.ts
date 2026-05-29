import { db } from '../lib/db';

export interface SyncAction {
    id: string;
    label: string;
    status: 'success' | 'failed' | 'pending';
    error?: string;
}

export interface SyncLog {
    id?: number;
    timestamp: number;
    status: 'success' | 'failed' | 'in_progress';
    message: string;
    itemsCount?: number;
    actions?: SyncAction[];
}

export const syncAnalyticsService = {
    async addLog(log: Omit<SyncLog, 'id'>) {
        // We'll use a specific table in Dexie if available, 
        // or just local storage for simplicity if we don't want to modify db.ts schema right now.
        // Let's check src/lib/db.ts first to see if I can add a table.
        const logs = JSON.parse(localStorage.getItem('ka_sync_logs') || '[]');
        logs.unshift({ ...log, id: Date.now() });
        localStorage.setItem('ka_sync_logs', JSON.stringify(logs.slice(0, 50))); // Keep last 50
    },

    async getLogs(): Promise<SyncLog[]> {
        return JSON.parse(localStorage.getItem('ka_sync_logs') || '[]');
    },

    async getLastSync(): Promise<SyncLog | null> {
        const logs = await this.getLogs();
        return logs.find(l => l.status === 'success') || null;
    }
};
