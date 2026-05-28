// DATA AUDIT: Contains DebtItem and related store actions ($runtimeLogs).
// Status: REAL project data (DT-01 to DT-03 canonical technical debt logs migrated from reference repository).

import { atom } from 'nanostores';

export interface DebtItem {
  id: string;
  title: string;
  type: 'debt' | 'refactor';
  date: string;
  status: 'Open' | 'Resolved';
  relatedStory?: string;
  participants?: string[];
}

const STORAGE_KEY = 'xp-flow-logs';

function loadLogs(): DebtItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export const $runtimeLogs = atom<DebtItem[]>(loadLogs());

if (typeof window !== 'undefined') {
  $runtimeLogs.subscribe((val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  });
}

let logCounter = 0;

export function initializeLogs(staticLogs: DebtItem[]) {
  if (typeof window === 'undefined') {
    $runtimeLogs.set(staticLogs);
    return;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    $runtimeLogs.set(staticLogs);
  } else {
    try {
      const local = JSON.parse(saved) as DebtItem[];
      const localIds = new Set(local.map((l) => l.id));
      const merged = [...local];
      for (const l of staticLogs) {
        if (!localIds.has(l.id)) {
          merged.push(l);
        }
      }
      $runtimeLogs.set(merged);
    } catch {
      $runtimeLogs.set(staticLogs);
    }
  }
}

export function updateLogStatus(id: string, status: 'Open' | 'Resolved') {
  $runtimeLogs.set($runtimeLogs.get().map((l) => (l.id === id ? { ...l, status } : l)));
}

export function addLog(log: Omit<DebtItem, 'id' | 'date'> & { date?: string }) {
  const id = `runtime-log-${Date.now()}-${logCounter++}`;
  const date = log.date || new Date().toISOString().split('T')[0];
  $runtimeLogs.set([...$runtimeLogs.get(), { ...log, id, date } as DebtItem]);
}
