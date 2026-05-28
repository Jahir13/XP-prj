import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, updateStoryStatus } from '../../store/stories';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StoryItem {
  id: string;
  title: string;
  points: number;
  status: 'Backlog' | 'Current' | 'Done';
  risk: 'Low' | 'Medium' | 'High';
  businessValue: number;
  assignedPair: string[];
  isTDD: boolean;
}

interface Props {
  initialStories: StoryItem[];
  iteration: { name: string; number: number; capacity: number };
}

const riskIcon = { Low: '🟢', Medium: '🟡', High: '🔴' };

function SortableStoryCard({ story }: { story: StoryItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group p-3.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/80 cursor-grab active:cursor-grabbing transition-all duration-150"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-zinc-200 leading-snug pr-2">{story.title}</span>
        <span className="flex-shrink-0 text-sm font-bold font-mono text-indigo-400">{story.points}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">{riskIcon[story.risk]}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: story.businessValue }).map((_, i) => (
            <span key={i} className="text-amber-400 text-[10px]">
              ★
            </span>
          ))}
        </div>
        {story.isTDD && (
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">TDD</span>
        )}
        {story.assignedPair.length > 0 && (
          <span className="text-[10px] text-zinc-500">👥 {story.assignedPair.length}</span>
        )}
      </div>
    </div>
  );
}

function StoryCardOverlay({ story }: { story: StoryItem }) {
  return (
    <div className="p-3.5 rounded-lg bg-zinc-800 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 cursor-grabbing">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-zinc-200">{story.title}</span>
        <span className="text-sm font-bold font-mono text-indigo-400">{story.points}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">{riskIcon[story.risk]}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: story.businessValue }).map((_, i) => (
            <span key={i} className="text-amber-400 text-[10px]">
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type ColumnId = 'Backlog' | 'Current' | 'Done';

const columnConfig: Record<ColumnId, { label: string; accent: string; dotColor: string; headerBg: string }> = {
  Backlog: { label: 'Backlog (Por hacer)', accent: 'text-sky-400', dotColor: 'bg-sky-400', headerBg: 'bg-sky-500/5' },
  Current: { label: 'En Curso', accent: 'text-amber-400', dotColor: 'bg-amber-400', headerBg: 'bg-amber-500/5' },
  Done: { label: 'Terminado', accent: 'text-emerald-400', dotColor: 'bg-emerald-400', headerBg: 'bg-emerald-500/5' },
};

export default function IterationBoard({ initialStories, iteration }: Props) {
  const runtimeStories = useStore($runtimeStories);

  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories.map((s) => ({
      id: s.id,
      title: s.title,
      points: s.points,
      status: s.status,
      risk: s.risk,
      businessValue: s.businessValue,
      assignedPair: s.assignedPair,
      isTDD: s.isTDD,
    }));
  }, [runtimeStories, initialStories]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const columns: Record<ColumnId, StoryItem[]> = useMemo(
    () => ({
      Backlog: stories.filter((s) => s.status === 'Backlog'),
      Current: stories.filter((s) => s.status === 'Current'),
      Done: stories.filter((s) => s.status === 'Done'),
    }),
    [stories],
  );

  const currentPoints =
    columns.Current.reduce((sum, s) => sum + s.points, 0) + columns.Done.reduce((sum, s) => sum + s.points, 0);
  const isOverCapacity = currentPoints > iteration.capacity;

  function findColumnForStory(id: string): ColumnId | null {
    for (const col of ['Backlog', 'Current', 'Done'] as ColumnId[]) {
      if (columns[col].some((s) => s.id === id)) return col;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    // Role check: anyone can move cards
    const isAllowed = true;

    if (!isAllowed) {
      setRoleError(
        'Acceso Denegado: Solo los programadores/testers, el Gestor o el Coach pueden reorganizar o mover historias de usuario.',
      );
      setTimeout(() => setRoleError(null), 4000);
      return;
    }

    const activeStoryId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetColumn: ColumnId;
    if (['Backlog', 'Current', 'Done'].includes(overId)) {
      targetColumn = overId as ColumnId;
    } else {
      const col = findColumnForStory(overId);
      if (!col) return;
      targetColumn = col;
    }

    updateStoryStatus(activeStoryId, targetColumn);
  }

  const activeStory = activeId ? stories.find((s) => s.id === activeId) : null;

  return (
    <div>
      {roleError && (
        <div className="mb-4 text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg animate-pulse">
          ⚠️ {roleError}
        </div>
      )}

      {/* Velocity Header */}
      <div
        className={`mb-6 p-4 rounded-xl border backdrop-blur-sm transition-colors duration-300 ${
          isOverCapacity ? 'bg-rose-500/5 border-rose-500/20' : 'bg-zinc-900/60 border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${isOverCapacity ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`}
            />
            <span className="text-sm font-semibold text-zinc-200">{iteration.name}</span>
            <span className="text-xs font-mono text-zinc-500">Iter #{iteration.number}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className={`text-lg font-bold font-mono ${isOverCapacity ? 'text-rose-400' : 'text-zinc-100'}`}>
                {currentPoints}
              </span>
              <span className="text-sm font-mono text-zinc-500"> / {iteration.capacity} pts</span>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                isOverCapacity
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isOverCapacity ? '⚠ SOBRE CAPACIDAD' : '✓ AL DÍA'}
            </span>
          </div>
        </div>
        {/* Capacity bar */}
        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverCapacity ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
            style={{ width: `${Math.min(100, (currentPoints / Math.max(iteration.capacity, 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* DnD Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {(['Backlog', 'Current', 'Done'] as ColumnId[]).map((colId) => {
            const config = columnConfig[colId];
            const colStories = columns[colId];
            const colPoints = colStories.reduce((sum, s) => sum + s.points, 0);

            return (
              <div key={colId} className="rounded-xl bg-zinc-900/40 border border-zinc-800/50 overflow-hidden">
                {/* Column Header */}
                <div className={`px-4 py-3 border-b border-zinc-800/50 ${config.headerBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                      <span className={`text-sm font-semibold ${config.accent}`}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500">{colStories.length}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-xs font-mono text-zinc-400">{colPoints} pts</span>
                    </div>
                  </div>
                </div>

                {/* Droppable Area */}
                <SortableContext id={colId} items={colStories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="p-3 space-y-2 min-h-[200px]" id={colId}>
                    {colStories.map((story) => (
                      <SortableStoryCard key={story.id} story={story} />
                    ))}
                    {colStories.length === 0 && (
                      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-zinc-700/50 text-xs text-zinc-600">
                        Arrastra historias aquí
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>{activeStory && <StoryCardOverlay story={activeStory} />}</DragOverlay>
      </DndContext>
    </div>
  );
}
