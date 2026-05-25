import { describe, it, expect, beforeEach } from 'vitest';
import { $runtimeStories, addStory, updateStoryStatus, removeStory, initializeStories } from '../stories';

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
});
