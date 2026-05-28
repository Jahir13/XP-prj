// DATA AUDIT: Contains PairSessionState, PairSessionLog and actions ($pairSession, $sessionHistory).
// Status: REAL project data (the 4 canonical pair programming sessions seeded, and strict validation enforced).

import { atom, map } from 'nanostores';

export interface PairSessionState {
  isActive: boolean;
  driver: string;
  navigator: string;
  startTime: number;
  elapsedSeconds: number;
}

export interface PairSessionLog {
  id: string;
  driver: string;
  navigator: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  relatedStory?: string;
}

const STORAGE_KEY = 'xp-flow-pair-session';
const HISTORY_KEY = 'xp-flow-pair-history';

export const ELIGIBLE_PAIRS = ['Christian Puchaicela', 'Jahir Rocha', 'Kevin Palacios', 'Jhonathan Pulig'];

export function validatePair(driver: string, navigator: string): string | null {
  if (!driver || !navigator) return 'Ambos participantes son requeridos.';
  if (driver === navigator) return 'El Conductor y el Navegador no pueden ser la misma persona.';
  if (!ELIGIBLE_PAIRS.includes(driver)) {
    return 'Este miembro no puede participar en sesiones de programación en pareja según las reglas XP del equipo.';
  }
  if (!ELIGIBLE_PAIRS.includes(navigator)) {
    return 'Este miembro no puede participar en sesiones de programación en pareja según las reglas XP del equipo.';
  }
  return null;
}

function getSeedHistory(): PairSessionLog[] {
  return [
    {
      id: 'session-seed-1',
      driver: 'Kevin Palacios',
      navigator: 'Christian Puchaicela',
      startTime: new Date('2026-05-02T10:00:00Z').getTime(),
      endTime: new Date('2026-05-02T11:30:00Z').getTime(),
      durationMinutes: 90,
      relatedStory: 'HU-01',
    },
    {
      id: 'session-seed-2',
      driver: 'Jhonathan Pulig',
      navigator: 'Jahir Rocha',
      startTime: new Date('2026-05-03T14:00:00Z').getTime(),
      endTime: new Date('2026-05-03T16:00:00Z').getTime(),
      durationMinutes: 120,
      relatedStory: 'HU-02',
    },
    {
      id: 'session-seed-3',
      driver: 'Christian Puchaicela',
      navigator: 'Jhonathan Pulig',
      startTime: new Date('2026-05-18T09:00:00Z').getTime(),
      endTime: new Date('2026-05-18T11:30:00Z').getTime(),
      durationMinutes: 150,
      relatedStory: 'HU-04',
    },
    {
      id: 'session-seed-4',
      driver: 'Kevin Palacios',
      navigator: 'Jahir Rocha',
      startTime: new Date('2026-05-20T15:00:00Z').getTime(),
      endTime: new Date('2026-05-20T18:00:00Z').getTime(),
      durationMinutes: 180,
      relatedStory: 'HU-05',
    },
  ];
}

function loadSession(): PairSessionState {
  if (typeof window === 'undefined') return getDefaultSession();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultSession();
}

function getDefaultSession(): PairSessionState {
  return {
    isActive: false,
    driver: '',
    navigator: '',
    startTime: 0,
    elapsedSeconds: 0,
  };
}

function loadHistory(): PairSessionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}

  // Save seed history so it persists
  const seed = getSeedHistory();
  if (typeof window !== 'undefined') {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(seed));
  }
  return seed;
}

export const $pairSession = map<PairSessionState>(loadSession());
export const $sessionHistory = atom<PairSessionLog[]>(loadHistory());

// Persist on change
if (typeof window !== 'undefined') {
  $pairSession.subscribe((val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  });
  $sessionHistory.subscribe((val) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(val));
  });
}

export function startSession(driver: string, navigator: string) {
  const err = validatePair(driver, navigator);
  if (err) {
    throw new Error(err);
  }
  $pairSession.setKey('isActive', true);
  $pairSession.setKey('driver', driver);
  $pairSession.setKey('navigator', navigator);
  $pairSession.setKey('startTime', Date.now());
  $pairSession.setKey('elapsedSeconds', 0);
}

export function stopSession() {
  const session = $pairSession.get();
  if (session.isActive) {
    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - session.startTime) / 60000);
    const log: PairSessionLog = {
      id: `session-${Date.now()}`,
      driver: session.driver,
      navigator: session.navigator,
      startTime: session.startTime,
      endTime,
      durationMinutes,
    };
    $sessionHistory.set([...$sessionHistory.get(), log]);
  }
  $pairSession.set(getDefaultSession());
}

export function swapRoles() {
  const session = $pairSession.get();
  $pairSession.setKey('driver', session.navigator);
  $pairSession.setKey('navigator', session.driver);
}

export function tickSession() {
  const session = $pairSession.get();
  if (session.isActive) {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    $pairSession.setKey('elapsedSeconds', elapsed);
  }
}

export function exportSessionToMarkdown(log: PairSessionLog): string {
  const date = new Date(log.startTime).toISOString().split('T')[0];
  return `---
type: "pair-session"
title: "Pair Session - ${log.driver} & ${log.navigator}"
date: ${date}
participants:
  - "${log.driver}"
  - "${log.navigator}"
durationMinutes: ${log.durationMinutes}
status: "Resolved"
---

## Pair Session

**Driver:** ${log.driver}  
**Navigator:** ${log.navigator}  
**Duration:** ${log.durationMinutes} minutes  
**Date:** ${date}
`;
}
