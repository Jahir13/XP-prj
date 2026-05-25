import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip);

interface StoryMetric {
  id: string;
  points: number;
  status: string;
}

interface IterationMetric {
  number: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function BurndownChart({
  stories: initialStories,
  iterations,
}: {
  stories: StoryMetric[];
  iterations: IterationMetric[];
}) {
  const runtimeStories = useStore($runtimeStories);

  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  const activeIteration = iterations.find((i) => i.status === 'Active') || iterations[0];
  if (!activeIteration) return <div className="text-sm text-zinc-500 text-center py-8">No iteration data</div>;

  const totalPoints = stories.filter((s) => s.status !== 'Backlog' || true).reduce((sum, s) => sum + s.points, 0);
  const donePoints = stories.filter((s) => s.status === 'Done').reduce((sum, s) => sum + s.points, 0);
  const start = new Date(activeIteration.startDate);
  const end = new Date(activeIteration.endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const labels = Array.from({ length: totalDays + 1 }, (_, i) => `Day ${i}`);
  const idealBurndown = labels.map((_, i) => Math.round(totalPoints - (totalPoints / totalDays) * i));

  // Simulated actual (based on done ratio)
  const daysPassed = Math.min(totalDays, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const actual = labels.map((_, i) => {
    if (i > daysPassed) return null;
    const progress = i / totalDays;
    const remaining = totalPoints - Math.round(donePoints * (progress / Math.max(daysPassed / totalDays, 0.01)));
    return Math.max(0, remaining);
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Ideal',
        data: idealBurndown,
        borderColor: '#52525b',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
      {
        label: 'Actual',
        data: actual,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
        tension: 0.3,
        fill: true,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: '#27272a',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: '#27272a33' },
        border: { color: '#27272a' },
      },
      y: {
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: '#27272a33' },
        border: { color: '#27272a' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-[2px] bg-zinc-500" style={{ borderBottom: '2px dashed #52525b' }} />
          <span className="text-[10px] text-zinc-500 font-mono">Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-[2px] bg-indigo-500" />
          <span className="text-[10px] text-zinc-500 font-mono">Actual</span>
        </div>
      </div>
    </div>
  );
}
