import { useEffect } from 'react';
import { initializeStories, type RuntimeStory } from '../../store/stories';
import { initializeLogs, type DebtItem } from '../../store/logs';

interface Props {
  staticStories: RuntimeStory[];
  staticLogs: DebtItem[];
}

export default function StoreInitializer({ staticStories, staticLogs }: Props) {
  useEffect(() => {
    initializeStories(staticStories);
    initializeLogs(staticLogs);
  }, [staticStories, staticLogs]);

  return null;
}
