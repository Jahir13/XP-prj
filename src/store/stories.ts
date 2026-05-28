// DATA AUDIT: Contains RuntimeStory and related store actions ($runtimeStories, $storyFilter).
// Status: REAL project data (HU-01 to HU-07 canonical stories migrated from reference repository).

import { atom, map } from 'nanostores';

export interface RuntimeStory {
  id: string;
  title: string;
  businessValue: number;
  risk: 'Low' | 'Medium' | 'High';
  points: number;
  status: 'Backlog' | 'Current' | 'Done';
  iteration?: string;
  assignedPair: string[];
  isTDD: boolean;
  acceptanceCriteria: string[];
  createdBy: 'Client' | 'Programmer';
  estimatedBy?: string;
}

const STORAGE_KEY = 'xp-flow-stories';

function loadStories(): RuntimeStory[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export const $runtimeStories = atom<RuntimeStory[]>(loadStories());
export const $storyFilter = map({
  status: '' as string,
  risk: '' as string,
  search: '' as string,
});

if (typeof window !== 'undefined') {
  $runtimeStories.subscribe((val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  });
}

let addCounter = 0;

export function initializeStories(staticStories: RuntimeStory[]) {
  if (typeof window === 'undefined') {
    $runtimeStories.set(staticStories);
    return;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    $runtimeStories.set(staticStories);
  } else {
    try {
      const local = JSON.parse(saved) as RuntimeStory[];
      const localIds = new Set(local.map((s) => s.id));
      const merged = [...local];
      for (const s of staticStories) {
        if (!localIds.has(s.id)) {
          merged.push(s);
        }
      }
      $runtimeStories.set(merged);
    } catch {
      $runtimeStories.set(staticStories);
    }
  }
}

export function addStory(story: Omit<RuntimeStory, 'id'>) {
  const id = `runtime-story-${Date.now()}-${addCounter++}`;
  $runtimeStories.set([...$runtimeStories.get(), { ...story, id }]);
}

export function updateStoryStatus(id: string, status: RuntimeStory['status']) {
  $runtimeStories.set($runtimeStories.get().map((s) => (s.id === id ? { ...s, status } : s)));
}

export function updateStory(id: string, updates: Partial<RuntimeStory>) {
  $runtimeStories.set($runtimeStories.get().map((s) => (s.id === id ? { ...s, ...updates } : s)));
}

export function removeStory(id: string) {
  $runtimeStories.set($runtimeStories.get().filter((s) => s.id !== id));
}
