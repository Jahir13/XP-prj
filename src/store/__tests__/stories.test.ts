import { describe, it, expect, beforeEach } from 'vitest';
import {
  $runtimeStories,
  addStory,
  updateStoryStatus,
  removeStory,
  initializeStories,
  calculateIterationPoints,
} from '../stories';

beforeEach(() => {
  $runtimeStories.set([]);
});

describe('stories store', () => {
  it('initializes with empty array', () => {
    expect($runtimeStories.get()).toEqual([]);
  });

  it('adds a story', () => {
    addStory({
      title: 'Test story',
      businessValue: 3,
      risk: 'Medium',
      points: 5,
      status: 'Backlog',
      assignedPair: [],
      isTDD: true,
      acceptanceCriteria: ['Works'],
      createdBy: 'Client',
    });
    const stories = $runtimeStories.get();
    expect(stories).toHaveLength(1);
    expect(stories[0].title).toBe('Test story');
    expect(stories[0].isTDD).toBe(true);
  });

  it('updates story status', () => {
    addStory({
      title: 'T1',
      businessValue: 1,
      risk: 'Low',
      points: 1,
      status: 'Backlog',
      assignedPair: [],
      isTDD: false,
      acceptanceCriteria: [],
      createdBy: 'Client',
    });
    const id = $runtimeStories.get()[0].id;
    updateStoryStatus(id, 'Done');
    expect($runtimeStories.get()[0].status).toBe('Done');
  });

  it('removes a story', () => {
    addStory({
      title: 'T1',
      businessValue: 1,
      risk: 'Low',
      points: 1,
      status: 'Backlog',
      assignedPair: [],
      isTDD: false,
      acceptanceCriteria: [],
      createdBy: 'Client',
    });
    addStory({
      title: 'T2',
      businessValue: 2,
      risk: 'Medium',
      points: 2,
      status: 'Backlog',
      assignedPair: [],
      isTDD: false,
      acceptanceCriteria: [],
      createdBy: 'Programmer',
    });
    const id = $runtimeStories.get()[0].id;
    removeStory(id);
    expect($runtimeStories.get()).toHaveLength(1);
    expect($runtimeStories.get()[0].title).toBe('T2');
  });

  it('initializes from static stories', () => {
    const staticStories = [
      {
        id: 's1',
        title: 'Static',
        businessValue: 5,
        risk: 'Low' as const,
        points: 3,
        status: 'Backlog' as const,
        assignedPair: [],
        isTDD: false,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
    ];
    initializeStories(staticStories);
    expect($runtimeStories.get()).toHaveLength(1);
  });

  it('calculates iteration points correctly using canonical data', () => {
    const canonicalStories = [
      {
        id: 'HU-01',
        title: 'HU-01',
        points: 2,
        status: 'Done' as const,
        iteration: 'iteration-1',
        assignedPair: ['Kevin'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-02',
        title: 'HU-02',
        points: 3,
        status: 'Done' as const,
        iteration: 'iteration-1',
        assignedPair: ['Jhonathan'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-03',
        title: 'HU-03',
        points: 5,
        status: 'Backlog' as const,
        iteration: 'iteration-3',
        assignedPair: ['Kevin'],
        isTDD: false,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-04',
        title: 'HU-04',
        points: 4,
        status: 'Done' as const,
        iteration: 'iteration-2',
        assignedPair: ['Jhonathan'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-05',
        title: 'HU-05',
        points: 3,
        status: 'Done' as const,
        iteration: 'iteration-2',
        assignedPair: ['Kevin'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-06',
        title: 'HU-06',
        points: 3,
        status: 'Done' as const,
        iteration: 'iteration-2',
        assignedPair: ['Jhonathan'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
      {
        id: 'HU-07',
        title: 'HU-07',
        points: 2,
        status: 'Current' as const,
        iteration: 'iteration-3',
        assignedPair: ['Kevin'],
        isTDD: true,
        acceptanceCriteria: [],
        createdBy: 'Client' as const,
      },
    ];

    expect(calculateIterationPoints(canonicalStories, 1)).toBe(5);
    expect(calculateIterationPoints(canonicalStories, 2)).toBe(10);
    expect(calculateIterationPoints(canonicalStories, 3)).toBe(7);
  });
});
