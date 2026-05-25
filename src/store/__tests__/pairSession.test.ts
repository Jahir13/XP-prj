import { describe, it, expect, beforeEach } from 'vitest';
import { $pairSession, $sessionHistory, startSession, stopSession, swapRoles, tickSession } from '../pairSession';

beforeEach(() => {
  $pairSession.set({
    isActive: false,
    driver: '',
    navigator: '',
    startTime: 0,
    elapsedSeconds: 0,
  });
  $sessionHistory.set([]);
});

describe('pairSession store', () => {
  it('starts a session', () => {
    startSession('Christian Puchaicela', 'Ariel Rosas');
    const session = $pairSession.get();
    expect(session.isActive).toBe(true);
    expect(session.driver).toBe('Christian Puchaicela');
    expect(session.navigator).toBe('Ariel Rosas');
    expect(session.elapsedSeconds).toBe(0);
  });

  it('swaps roles', () => {
    startSession('Christian Puchaicela', 'Ariel Rosas');
    swapRoles();
    const session = $pairSession.get();
    expect(session.driver).toBe('Ariel Rosas');
    expect(session.navigator).toBe('Christian Puchaicela');
  });

  it('stops a session and logs history', () => {
    startSession('Christian Puchaicela', 'Ariel Rosas');
    stopSession();

    const session = $pairSession.get();
    expect(session.isActive).toBe(false);
    expect(session.driver).toBe('');

    const history = $sessionHistory.get();
    expect(history).toHaveLength(1);
    expect(history[0].driver).toBe('Christian Puchaicela');
    expect(history[0].navigator).toBe('Ariel Rosas');
  });

  it('ticks a session', () => {
    startSession('Christian Puchaicela', 'Ariel Rosas');
    // Modify startTime to be 10 seconds ago
    const tenSecondsAgo = Date.now() - 10000;
    $pairSession.setKey('startTime', tenSecondsAgo);

    tickSession();

    const session = $pairSession.get();
    expect(session.elapsedSeconds).toBeGreaterThanOrEqual(10);
  });
});
