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
    startSession('Christian Puchaicela', 'Kevin Palacios');
    const session = $pairSession.get();
    expect(session.isActive).toBe(true);
    expect(session.driver).toBe('Christian Puchaicela');
    expect(session.navigator).toBe('Kevin Palacios');
    expect(session.elapsedSeconds).toBe(0);
  });

  it('swaps roles', () => {
    startSession('Christian Puchaicela', 'Kevin Palacios');
    swapRoles();
    const session = $pairSession.get();
    expect(session.driver).toBe('Kevin Palacios');
    expect(session.navigator).toBe('Christian Puchaicela');
  });

  it('stops a session and logs history', () => {
    startSession('Christian Puchaicela', 'Kevin Palacios');
    stopSession();

    const session = $pairSession.get();
    expect(session.isActive).toBe(false);
    expect(session.driver).toBe('');

    const history = $sessionHistory.get();
    // history length is 5 here because it includes the 4 seed sessions plus this new session
    expect(history.length).toBeGreaterThanOrEqual(1);
    const lastSession = history[history.length - 1];
    expect(lastSession.driver).toBe('Christian Puchaicela');
    expect(lastSession.navigator).toBe('Kevin Palacios');
  });

  it('ticks a session', () => {
    startSession('Christian Puchaicela', 'Kevin Palacios');
    // Modify startTime to be 10 seconds ago
    const tenSecondsAgo = Date.now() - 10000;
    $pairSession.setKey('startTime', tenSecondsAgo);

    tickSession();

    const session = $pairSession.get();
    expect(session.elapsedSeconds).toBeGreaterThanOrEqual(10);
  });
});
