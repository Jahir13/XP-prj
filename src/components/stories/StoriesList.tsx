import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, addStory, updateStory, type RuntimeStory } from '../../store/stories';
import StoryCard from './StoryCard';
import StoryForm from './StoryForm';
import Modal from '../ui/Modal';

interface Props {
  initialStories: RuntimeStory[];
}

export default function StoriesList({ initialStories }: Props) {
  const runtimeStories = useStore($runtimeStories);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [tddFilter, setTddFilter] = useState<string>('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<RuntimeStory | null>(null);

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
      const matchesSearch = story.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || story.status === statusFilter;
      const matchesRisk = riskFilter === 'All' || story.risk === riskFilter;
      const matchesTdd =
        tddFilter === 'All' || (tddFilter === 'TDD' && story.isTDD) || (tddFilter === 'Non-TDD' && !story.isTDD);
      return matchesSearch && matchesStatus && matchesRisk && matchesTdd;
    });
  }, [stories, search, statusFilter, riskFilter, tddFilter]);

  // Sort order: Current first, then Backlog, then Done
  const sortedStories = useMemo(() => {
    const statusOrder = { Current: 0, Backlog: 1, Done: 2 };
    return [...filteredStories].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [filteredStories]);

  const handleSave = (storyData: Omit<RuntimeStory, 'id'> & { id?: string }) => {
    if (storyData.id) {
      // Editing
      updateStory(storyData.id, storyData as Partial<RuntimeStory>);
    } else {
      // Creating
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
    setEditingStory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              aria-label="Buscar historias de usuario"
              placeholder="Buscar historias de usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por estado de historia"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors"
            >
              <option value="All">Todos los estados</option>
              <option value="Backlog">Backlog (Por hacer)</option>
              <option value="Current">En progreso</option>
              <option value="Done">Terminado</option>
            </select>

            {/* Risk Select */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filtrar por riesgo de historia"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors"
            >
              <option value="All">Todos los riesgos</option>
              <option value="Low">Riesgo Bajo</option>
              <option value="Medium">Riesgo Medio</option>
              <option value="High">Riesgo Alto</option>
            </select>

            {/* TDD Select */}
            <select
              value={tddFilter}
              onChange={(e) => setTddFilter(e.target.value)}
              aria-label="Filtrar por adopción de TDD"
              className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors"
            >
              <option value="All">Toda la ingeniería</option>
              <option value="TDD">TDD (Primero las pruebas)</option>
              <option value="Non-TDD">Sin TDD</option>
            </select>
          </div>
        </div>

        {/* Create Card Button */}
        <button
          onClick={handleCreateClick}
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 px-4.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>📝</span> Escribir Historia de Usuario
        </button>
      </div>

      {/* Card count */}
      <div className="flex justify-between items-center text-xs text-zinc-500 font-mono px-1">
        <span>
          Mostrando {sortedStories.length} de {stories.length} historias
        </span>
        <span>Puntos Totales: {sortedStories.reduce((sum, s) => sum + s.points, 0)} pts</span>
      </div>

      {/* Story Grid */}
      {sortedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {sortedStories.map((story) => (
            <StoryCard key={story.id} story={story} onEdit={handleEditClick} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <span className="text-3xl mb-3">🗂️</span>
          <h3 className="text-sm font-semibold text-zinc-400">Ninguna historia coincide con los filtros</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
            Intente ajustar sus criterios de búsqueda o cree una nueva tarjeta de historia de usuario con el botón de
            arriba.
          </p>
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
    </div>
  );
}
