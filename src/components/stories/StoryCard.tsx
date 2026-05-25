import { useState } from 'react';
import type { RuntimeStory } from '../../store/stories';

interface Props {
  story: RuntimeStory;
  onEdit?: (story: RuntimeStory) => void;
}

const statusColors = {
  Backlog: { border: 'border-l-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-400', borderColor: 'border-sky-500/20' },
  Current: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  Done: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
};

const riskColors = {
  Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', borderColor: 'border-amber-500/20' },
  High: { bg: 'bg-rose-500/10', text: 'text-rose-400', borderColor: 'border-rose-500/20' },
};

const statusTranslations = {
  Backlog: 'Backlog',
  Current: 'En Curso',
  Done: 'Terminado',
};

const riskTranslations = {
  Low: 'Bajo',
  Medium: 'Medio',
  High: 'Alto',
};

const createdByTranslations = {
  Client: 'Cliente',
  Programmer: 'Programador',
};

export default function StoryCard({ story, onEdit }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const sc = statusColors[story.status];
  const rc = riskColors[story.risk];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    // Smooth 3D tilt calculations
    const rotX = -(y / (box.height / 2)) * 8; // Max 8 degrees rotation
    const rotY = (x / (box.width / 2)) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.15)',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative w-full h-[260px] cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      aria-label={`Historia de usuario: ${story.title}. Estado: ${statusTranslations[story.status]}. ${story.points} puntos. Presiona espacio o enter para voltear y ver criterios de aceptación.`}
    >
      {/* 3D Inner Wrapper */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : undefined,
          ...tiltStyle,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* FRONT OF THE INDEX CARD */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl bg-zinc-900/90 border border-zinc-800 border-l-[4px] ${sc.border} p-5 flex flex-col justify-between backface-hidden shadow-xl`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div>
            {/* Header: Title + Points */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <h3 className="text-sm font-semibold text-zinc-100 leading-snug group-hover:text-white transition-colors">
                {story.title}
              </h3>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold font-mono text-indigo-400">{story.points}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">puntos</span>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${sc.bg} ${sc.text} ${sc.borderColor}`}
              >
                {statusTranslations[story.status]}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${rc.bg} ${rc.text} ${rc.borderColor}`}
              >
                Riesgo {riskTranslations[story.risk]}
              </span>
              {story.isTDD && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  TDD ✓
                </span>
              )}
            </div>

            {/* Business Value Stars */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <svg
                  key={idx}
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill={idx < story.businessValue ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={idx < story.businessValue ? 'text-amber-400' : 'text-zinc-700'}
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="ml-1 text-[10px] text-zinc-500 font-mono">VN {story.businessValue}</span>
            </div>
          </div>

          {/* Footer Info & Actions */}
          <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-400">
              {story.assignedPair.length > 0 ? (
                <>
                  <span role="img" aria-label="Pareja asignada">
                    👥
                  </span>
                  <span className="text-zinc-300 font-medium truncate max-w-[120px]">
                    {story.assignedPair.join(' & ')}
                  </span>
                </>
              ) : (
                <span className="text-zinc-600 italic">Sin asignar</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(story);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-[10px] cursor-pointer"
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="text-[10px] font-mono text-indigo-500 hover:text-indigo-400 flex items-center gap-0.5 bg-transparent border-none cursor-pointer focus:outline-none"
              >
                Voltear ↺
              </button>
            </div>
          </div>
        </div>

        {/* BACK OF THE INDEX CARD (ACCEPTANCE CRITERIA) */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-zinc-950 border border-zinc-800 border-r-[4px] border-r-indigo-500/50 p-5 flex flex-col justify-between backface-hidden shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-semibold">
                Criterios de Aceptación
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Reverso</span>
            </div>

            <ul className="space-y-1.5 overflow-y-auto pr-1 flex-1">
              {story.acceptanceCriteria.length > 0 ? (
                story.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span
                      className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 text-[9px] ${
                        story.status === 'Done'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                          : 'border-zinc-700 text-transparent'
                      }`}
                    >
                      {story.status === 'Done' ? '✓' : ''}
                    </span>
                    <span className="leading-normal">{criteria}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-zinc-600 italic">Sin criterios de aceptación definidos</li>
              )}
            </ul>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Creado por: {createdByTranslations[story.createdBy] || story.createdBy}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="text-indigo-500 font-semibold hover:text-indigo-400 bg-transparent border-none cursor-pointer focus:outline-none"
            >
              Volver ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
