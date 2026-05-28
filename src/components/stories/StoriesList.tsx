import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, addStory, updateStory, updateStoryStatus, type RuntimeStory } from '../../store/stories';
import { $currentUser } from '../../store/auth';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';
import StoryDetailDrawer from './StoryDetailDrawer';
import Modal from '../ui/Modal';

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

interface Props {
  initialStories: RuntimeStory[];
  iteration?: { name: string; number: number; capacity: number } | null;
}

type ColumnId = 'Backlog' | 'Current' | 'Done';

const columnConfig: Record<ColumnId, { label: string; accent: string; dotColor: string; headerBg: string }> = {
  Backlog: { label: 'Backlog (Por hacer)', accent: 'text-sky-400', dotColor: 'bg-sky-400', headerBg: 'bg-sky-500/5' },
  Current: { label: 'En Curso', accent: 'text-amber-400', dotColor: 'bg-amber-400', headerBg: 'bg-amber-500/5' },
  Done: { label: 'Terminado', accent: 'text-emerald-400', dotColor: 'bg-emerald-400', headerBg: 'bg-emerald-500/5' },
};

function SortableKanbanCard({ story, onClick }: { story: RuntimeStory; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColors = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  const riskColors = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  const priorityLabels = { High: 'Alta', Medium: 'Media', Low: 'Baja' };
  const riskLabels = { High: 'Alto', Medium: 'Medio', Low: 'Bajo' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="group p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20 cursor-grab active:cursor-grabbing transition-all select-none space-y-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
    >
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {story.id.toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          {story.isTDD && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="TDD Habilitado" />}
          <span className="text-[9px] text-zinc-500 font-mono">
            {story.iteration ? `Iter ${story.iteration.split('-')[1]}` : 'Sin Iter'}
          </span>
        </div>
      </div>

      <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors line-clamp-2 leading-relaxed">
        {story.title}
      </h4>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono border ${priorityColors[story.risk] || priorityColors.Low}`}
        >
          P: {priorityLabels[story.risk] || 'Media'}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono border ${riskColors[story.risk] || riskColors.Low}`}
        >
          R: {riskLabels[story.risk] || 'Bajo'}
        </span>
      </div>

      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[9.5px] text-zinc-400 truncate max-w-[120px]">
          {story.assignedPair.length > 0 ? (
            <span className="truncate">👥 {story.assignedPair.join(' & ')}</span>
          ) : (
            <span className="text-zinc-600 italic">Sin asignar</span>
          )}
        </div>

        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold font-mono text-indigo-400">
          {story.points}
        </div>
      </div>
    </div>
  );
}

function KanbanCardOverlay({ story }: { story: RuntimeStory }) {
  return (
    <div className="p-3.5 rounded-lg bg-zinc-900 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/25 space-y-3 opacity-90 cursor-grabbing">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {story.id.toUpperCase()}
        </span>
      </div>
      <h4 className="text-xs font-semibold text-zinc-200">{story.title}</h4>
      <div className="flex justify-between items-center text-[10px] text-zinc-400">
        <span>Puntos: {story.points}</span>
      </div>
    </div>
  );
}

export default function StoriesList({ initialStories, iteration }: Props) {
  const runtimeStories = useStore($runtimeStories);
  const currentUser = useStore($currentUser);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [iterationFilter, setIterationFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [assignedFilter, setAssignedFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<RuntimeStory | null>(null);
  const [selectedStory, setSelectedStory] = useState<RuntimeStory | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Active iteration capacity limit (default 10)
  const activeCapacity = iteration?.capacity ?? 10;

  // Combine static and runtime
  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch =
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.id.toLowerCase().includes(search.toLowerCase());
      const matchesIteration = iterationFilter === 'All' || story.iteration === iterationFilter;
      const matchesPriority = priorityFilter === 'All' || story.risk === priorityFilter;
      const matchesAssigned = assignedFilter === 'All' || story.assignedPair.includes(assignedFilter);
      return matchesSearch && matchesIteration && matchesPriority && matchesAssigned;
    });
  }, [stories, search, iterationFilter, priorityFilter, assignedFilter]);

  // Authorization checks
  const isAuthorizedToCreate = useMemo(() => {
    return (
      currentUser?.role === 'Cliente' ||
      currentUser?.role === 'Gestor' ||
      currentUser?.name === 'Ariel Rosas' ||
      currentUser?.name === 'Jahir Rocha'
    );
  }, [currentUser]);

  const canMoveCards = useMemo(() => {
    return (
      currentUser?.role === 'Programmer/Tester' ||
      currentUser?.name === 'Kevin Palacios' ||
      currentUser?.name === 'Jhonathan Pulig'
    );
  }, [currentUser]);

  const handleSave = (storyData: Omit<RuntimeStory, 'id'> & { id?: string }) => {
    if (storyData.id) {
      updateStory(storyData.id, storyData as Partial<RuntimeStory>);
    } else {
      addStory(storyData);
    }
    setIsModalOpen(false);
    setEditingStory(null);
  };

  const handleEditClick = (story: RuntimeStory) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    if (!isAuthorizedToCreate) return;
    setEditingStory(null);
    setIsModalOpen(true);
  };

  // DnD-kit setup
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const columns: Record<ColumnId, RuntimeStory[]> = useMemo(() => {
    return {
      Backlog: filteredStories.filter((s) => s.status === 'Backlog'),
      Current: filteredStories.filter((s) => s.status === 'Current'),
      Done: filteredStories.filter((s) => s.status === 'Done'),
    };
  }, [filteredStories]);

  const activeStory = activeDragId ? stories.find((s) => s.id === activeDragId) : null;

  function findColumnForStory(id: string): ColumnId | null {
    for (const col of ['Backlog', 'Current', 'Done'] as ColumnId[]) {
      if (columns[col].some((s) => s.id === id)) return col;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    // Check permission immediately on drag start to notify
    if (!canMoveCards) {
      setRoleError('Solo los Programadores/Testers pueden cambiar el estado de una historia.');
      setTimeout(() => setRoleError(null), 4000);
      return;
    }
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    if (!canMoveCards) {
      return; // permission denied
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetColumn: ColumnId;
    if (['Backlog', 'Current', 'Done'].includes(overId)) {
      targetColumn = overId as ColumnId;
    } else {
      const col = findColumnForStory(overId);
      if (!col) return;
      targetColumn = col;
    }

    updateStoryStatus(activeId, targetColumn);
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {roleError && (
        <div className="fixed top-20 right-8 z-50 text-xs text-rose-400 font-mono bg-rose-950/90 border border-rose-500/30 p-3.5 rounded-lg shadow-2xl animate-bounce">
          ⚠️ {roleError}
        </div>
      )}

      {/* Toolbar / Header Block */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4.5 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
            <input
              type="text"
              aria-label="Buscar historias de usuario"
              placeholder="Buscar por código o título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Iteration Filter */}
            <select
              value={iterationFilter}
              onChange={(e) => setIterationFilter(e.target.value)}
              aria-label="Filtrar por iteración"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Todas las Iteraciones</option>
              <option value="iteration-1">Iteración 1</option>
              <option value="iteration-2">Iteración 2</option>
              <option value="iteration-3">Iteración 3</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filtrar por riesgo"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Todas las prioridades</option>
              <option value="Low">Riesgo Bajo</option>
              <option value="Medium">Riesgo Medio</option>
              <option value="High">Riesgo Alto</option>
            </select>

            {/* Assigned Member Filter */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              aria-label="Filtrar por miembro asignado"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Todos los asignados</option>
              <option value="Christian Puchaicela">Christian Puchaicela</option>
              <option value="Jahir Rocha">Jahir Rocha</option>
              <option value="Kevin Palacios">Kevin Palacios</option>
              <option value="Jhonathan Pulig">Jhonathan Pulig</option>
            </select>
          </div>
        </div>

        {/* View Toggle + Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Toggle Kanban | Lista */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 flex gap-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-zinc-850 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Tablero Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-850 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Lista / Tarjetas 3D
            </button>
          </div>

          {/* Create Button with disabled tooltip support */}
          <div className="relative group">
            <button
              onClick={handleCreateClick}
              disabled={!isAuthorizedToCreate}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                isAuthorizedToCreate
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20'
                  : 'bg-zinc-850 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <span>📝</span> Escribir Historia
            </button>
            {!isAuthorizedToCreate && (
              <span className="absolute bottom-full right-0 mb-2 w-52 bg-zinc-950 text-zinc-400 border border-zinc-800 p-2 rounded text-[10px] font-mono leading-normal shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                🔒 Acceso Denegado: Solo el Cliente (Ariel Rosas) o el Gestor (Jahir Rocha) pueden crear historias.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      {viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
            {(['Backlog', 'Current', 'Done'] as ColumnId[]).map((colId) => {
              const col = columnConfig[colId];
              const colStories = columns[colId];
              const colPoints = colStories.reduce((sum, s) => sum + s.points, 0);
              const isOver = colPoints > activeCapacity && colId !== 'Done';

              return (
                <div
                  key={colId}
                  className={`rounded-xl border flex flex-col min-h-[480px] overflow-hidden transition-all duration-300 ${
                    isOver
                      ? 'bg-rose-950/10 border-rose-500/30 shadow-lg shadow-rose-500/5'
                      : 'bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm'
                  }`}
                >
                  {/* Column Header */}
                  <div
                    className={`px-4.5 py-3 border-b flex items-center justify-between transition-colors duration-300 ${
                      isOver ? 'bg-rose-500/5 border-rose-500/25' : `border-zinc-800 ${col.headerBg}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isOver ? 'bg-rose-500 animate-pulse' : col.dotColor}`} />
                      <span className={`text-xs font-bold ${isOver ? 'text-rose-400 font-extrabold' : col.accent}`}>
                        {col.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-zinc-500">{colStories.length}</span>
                      <span className="text-zinc-600">·</span>
                      <span className={`font-semibold ${isOver ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {colPoints} pts
                      </span>
                      {isOver && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/20 animate-pulse font-bold"
                          title={`Capacidad de la Iteración: ${activeCapacity} pts`}
                        >
                          LÍMITE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Draggable Stack */}
                  <SortableContext
                    id={colId}
                    items={colStories.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="p-3.5 space-y-3 flex-1 overflow-y-auto" id={colId}>
                      {colStories.map((story) => (
                        <SortableKanbanCard key={story.id} story={story} onClick={() => setSelectedStory(story)} />
                      ))}
                      {colStories.length === 0 && (
                        <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-zinc-800 text-zinc-600 text-xs italic">
                          Sin historias en esta columna
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>{activeStory && <KanbanCardOverlay story={activeStory} />}</DragOverlay>
        </DndContext>
      ) : (
        /* List Mode: Redesigned Flippable Cards */
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-zinc-500 font-mono px-1">
            <span>
              Mostrando {filteredStories.length} de {stories.length} historias
            </span>
            <span>Puntos Totales: {filteredStories.reduce((sum, s) => sum + s.points, 0)} pts</span>
          </div>

          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} onEdit={handleEditClick} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <span className="text-3xl mb-3">🗂️</span>
              <h3 className="text-sm font-semibold text-zinc-400">Ninguna historia coincide con los filtros</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
                Ajuste sus criterios de búsqueda o cree una nueva tarjeta de historia de usuario con el botón superior.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Story Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStory(null);
        }}
        title={editingStory ? 'Editar Historia de Usuario' : 'Escribir Nueva Historia de Usuario'}
        size="lg"
      >
        <StoryForm
          story={editingStory}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingStory(null);
          }}
        />
      </Modal>

      {/* Story Detail slide-over drawer */}
      <StoryDetailDrawer story={selectedStory} onClose={() => setSelectedStory(null)} />
    </div>
  );
}
