import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IterationMetric {
  name: string;
  number: number;
  velocity: number;
  capacity: number;
  status: string;
}

export default function VelocityChart({ iterations }: { iterations: IterationMetric[] }) {
  const runtimeStories = useStore($runtimeStories);

  // Compute live velocity for the Active iteration
  const processedIterations = useMemo(() => {
    return iterations.map((i) => {
      if (i.status === 'Active' && typeof window !== 'undefined' && runtimeStories.length > 0) {
        const donePoints = runtimeStories
          .filter((s) => {
            const storyIter = s.iteration || '';
            const matchNumber = storyIter.replace('iteration-', '') === String(i.number);
            return matchNumber && s.status === 'Done';
          })
          .reduce((sum, s) => sum + s.points, 0);

        return { ...i, velocity: donePoints };
      }
      return i;
    });
  }, [iterations, runtimeStories]);

  const data = {
    labels: processedIterations.map((i) => `Iter ${i.number}`),
    datasets: [
      {
        label: 'Velocity',
        data: processedIterations.map((i) => i.velocity),
        backgroundColor: processedIterations.map((i) =>
          i.velocity > i.capacity ? 'rgba(244,63,94,0.4)' : 'rgba(99,102,241,0.4)',
        ),
        borderColor: processedIterations.map((i) => (i.velocity > i.capacity ? '#f43f5e' : '#6366f1')),
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Capacity',
        data: processedIterations.map((i) => i.capacity),
        backgroundColor: 'rgba(113,113,122,0.15)',
        borderColor: '#52525b',
        borderWidth: 1,
        borderRadius: 6,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#a1a1aa',
          font: { size: 11, family: 'JetBrains Mono' },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: '#27272a',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 } },
        grid: { color: '#27272a' },
        border: { color: '#27272a' },
      },
      y: {
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 } },
        grid: { color: '#27272a33' },
        border: { color: '#27272a' },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}
