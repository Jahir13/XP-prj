---
type: 'debt'
title: 'Extract shared card styles into design tokens'
date: 2025-05-04
participants:
  - 'Carol Wu'
status: 'Open'
relatedStory: 'user-story-1'
---

## Technical Debt: Shared Card Styles

Currently, card styles are duplicated across StoryCard and IterationBoard components. Should extract into a shared design token system using CSS custom properties.

### Impact

- Medium: affects maintainability
- Risk of style drift between components

### Proposed Solution

- Create a `card` variant in the global CSS theme
- Use CSS custom properties for consistent spacing and colors
