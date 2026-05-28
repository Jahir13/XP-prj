import { useEffect } from 'react';
import { initializeStories, type RuntimeStory } from '../../store/stories';
import { initializeLogs, type DebtItem } from '../../store/logs';
import { fetchCurrentUser } from '../../store/auth';

interface Props {
  staticStories: RuntimeStory[];
  staticLogs: DebtItem[];
}

export default function StoreInitializer({ staticStories, staticLogs }: Props) {
  useEffect(() => {
    initializeStories(staticStories);
    initializeLogs(staticLogs);
    fetchCurrentUser();
  }, [staticStories, staticLogs]);

  return null;
}
