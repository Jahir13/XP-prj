import { atom, computed } from 'nanostores';
import type { Project, Iteration, Notification } from '../types';

export const $currentProject = atom<Project | null>(null);
export const $currentProjectId = computed($currentProject, (p) => p?.id ?? '');

export const $currentIteration = atom<Iteration | null>(null);

export const $notificationQueue = atom<Notification[]>([]);

export function clearNotification(id: string) {
  $notificationQueue.set($notificationQueue.get().filter((n) => n.id !== id));
}

export function clearAllNotifications() {
  $notificationQueue.set([]);
}
