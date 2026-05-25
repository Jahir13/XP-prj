import { onWsEvent } from './client';
import type { WsTestEvent, WsNotificationEvent } from '../types';
import { $notificationQueue } from '../store/notificationQueue';

export function registerWsHandlers() {
  const unsubs: (() => void)[] = [];

  // Build events — dispatched to CI dashboard via store subscription
  unsubs.push(
    onWsEvent('build:started', () => {
      /* handled by CI store */
    }),
  );
  unsubs.push(
    onWsEvent('build:success', () => {
      /* handled by CI store */
    }),
  );
  unsubs.push(
    onWsEvent('build:failed', () => {
      /* handled by CI store */
    }),
  );

  // Test failure notification
  unsubs.push(
    onWsEvent('test:failed', (payload) => {
      const ev = payload as unknown as WsTestEvent['payload'];
      $notificationQueue.set([
        ...$notificationQueue.get(),
        {
          id: `test-${Date.now()}`,
          userId: '',
          type: 'test:failed',
          title: 'Prueba Fallida',
          body: `${ev.name}: ${ev.failureMessage}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }),
  );

  // Story/iteration events — handled by respective store subscriptions
  unsubs.push(
    onWsEvent('story:updated', () => {
      /* handled by stories store */
    }),
  );
  unsubs.push(
    onWsEvent('iteration:velocity:updated', () => {
      /* handled by iterations store */
    }),
  );

  // Pair session events — handled by pair store
  unsubs.push(
    onWsEvent('pair:session:started', () => {
      /* handled by pair store */
    }),
  );
  unsubs.push(
    onWsEvent('pair:session:ended', () => {
      /* handled by pair store */
    }),
  );

  // New notification
  unsubs.push(
    onWsEvent('notification:new', (payload) => {
      const ev = payload as unknown as WsNotificationEvent['payload'];
      $notificationQueue.set([
        ...$notificationQueue.get(),
        {
          id: ev.notificationId,
          userId: '',
          type: 'notification:new',
          title: ev.title,
          body: ev.body,
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }),
  );

  // Standup — handled by standup store
  unsubs.push(
    onWsEvent('standup:submitted', () => {
      /* handled by standup store */
    }),
  );

  return () => unsubs.forEach((fn) => fn());
}
