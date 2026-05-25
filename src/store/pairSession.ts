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
  return [];
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
