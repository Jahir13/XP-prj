import { useState, useEffect } from 'react';

interface MetricProps {
  target: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

function Counter({ target, suffix = '', prefix = '', label }: MetricProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Ease out quad
      const easedPercentage = percentage * (2 - percentage);
      const current = Math.round(easedPercentage * target);

      setCount(current);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] transition-all duration-300">
      <span className="text-4xl md:text-5xl font-black font-mono text-indigo-400">
        {prefix}
        {count}
        {suffix}
      </span>
      <span className="text-xs md:text-sm font-semibold text-zinc-400 mt-2.5 text-center uppercase tracking-widest leading-relaxed">
        {label}
      </span>
    </div>
  );
}

export default function DemoMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
      <Counter target={12} label="prácticas XP integradas" />
      <Counter target={100} suffix="%" label="TypeScript estricto" />
      <Counter target={0} label="deuda técnica acumulada" />
    </div>
  );
}
