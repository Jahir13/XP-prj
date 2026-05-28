import { useEffect } from 'react';
import { initializeStories, type RuntimeStory } from '../../store/stories';
import { initializeLogs, type DebtItem } from '../../store/logs';
import { initializeIterations } from '../../store/iterations';
import { fetchCurrentUser } from '../../store/auth';
import type { Iteration } from '../../types';

interface Props {
  staticStories: RuntimeStory[];
  staticLogs: DebtItem[];
  staticIterations: Iteration[];
}

export default function StoreInitializer({ staticStories, staticLogs, staticIterations }: Props) {
  useEffect(() => {
    initializeStories(staticStories);
    initializeLogs(staticLogs);
    initializeIterations(staticIterations);
    fetchCurrentUser();
  }, [staticStories, staticLogs, staticIterations]);

  return null;
}
