import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  children,
  hover = true,
  glow = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-xl
        transition-all duration-200
        ${hover ? 'hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20' : ''}
        ${glow ? 'hover:shadow-indigo-500/10 hover:border-indigo-500/30' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
