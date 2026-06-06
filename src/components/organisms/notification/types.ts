export type NotificationType = 'deadline' | 'birthday' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
  priority: 'high' | 'normal';
}
