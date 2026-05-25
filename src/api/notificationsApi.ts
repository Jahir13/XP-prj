import { apiGet, apiPut, apiPatch } from './client';
import type { Notification, NotificationPreferences } from '../types';

export const notificationsApi = {
  list: () => apiGet<Notification[]>('/notifications'),

  markRead: (id: string) => apiPut<void>(`/notifications/${id}/read`),

  markAllRead: () => apiPut<void>('/notifications/read-all'),

  preferences: () => apiGet<NotificationPreferences>('/notifications/preferences'),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    apiPatch<NotificationPreferences>('/notifications/preferences', data),
};
