import { atom } from 'nanostores';
import type { Iteration } from '../types';

const STORAGE_KEY = 'xp-flow-iterations';

function loadIterations(): Iteration[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export const $iterations = atom<Iteration[]>(loadIterations());

if (typeof window !== 'undefined') {
  $iterations.subscribe((val) => {
    if (val && val.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    }
  });
}

export function initializeIterations(staticIterations: Iteration[]) {
  if (typeof window === 'undefined') {
    $iterations.set(staticIterations);
    return;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    // Set default capacities to [5, 10, 10]
    const updated = staticIterations.map((it) => {
      let cap = it.capacity;
      if (it.number === 1) cap = 5;
      if (it.number === 2) cap = 10;
      if (it.number === 3) cap = 10;
      return { ...it, capacity: cap };
    });
    $iterations.set(updated);
  } else {
    try {
      const local = JSON.parse(saved) as Iteration[];
      $iterations.set(local);
    } catch {
      $iterations.set(staticIterations);
    }
  }
}

export function updateIterationCapacity(id: string, capacity: number) {
  $iterations.set($iterations.get().map((i) => (i.id === id ? { ...i, capacity } : i)));
}
