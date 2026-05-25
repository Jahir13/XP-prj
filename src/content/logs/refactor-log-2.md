---
type: 'refactor'
title: 'Consolidate store initialization logic'
date: 2025-05-05
participants:
  - 'David Kim'
status: 'Open'
relatedStory: 'user-story-2'
---

## Refactor: Store Initialization

Nano Store initialization is scattered across components. Should centralize in a single initialization module that hydrates from localStorage on app boot.

### Impact

- Low: functional but messy
- Could cause race conditions if two islands initialize simultaneously
