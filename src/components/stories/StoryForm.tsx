import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import type { RuntimeStory } from '../../store/stories';
import { $isClientMode } from '../../store/ui';

interface Props {
  story?: RuntimeStory | null;
  teamMembers?: string[];
  onSave: (story: Omit<RuntimeStory, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const defaultTeam = [
  'Christian Puchaicela',
  'Ariel Rosas',
  'Jahir Rocha',
  'Kevin Palacios',
  'Jhonathan Pulig',
  'Santiago Pinta',
];

const riskLabels = {
  Low: 'Bajo',
  Medium: 'Medio',
  High: 'Alto',
};

const roleLabels = {
  Client: 'Cliente',
  Programmer: 'Programador',
};

export default function StoryForm({ story, teamMembers = defaultTeam, onSave, onCancel }: Props) {
  const isClientMode = useStore($isClientMode);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState<number>(3);
  const [businessValue, setBusinessValue] = useState<number>(3);
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [status, setStatus] = useState<'Backlog' | 'Current' | 'Done'>('Backlog');
  const [isTDD, setIsTDD] = useState(false);
  const [assignedPair, setAssignedPair] = useState<string[]>([]);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [newCriteria, setNewCriteria] = useState('');
  const [createdBy, setCreatedBy] = useState<'Client' | 'Programmer'>('Client');
  const [iteration, setIteration] = useState<string>('');

  // Hydrate fields if editing, reset to defaults if creating
  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setPoints(story.points);
      setBusinessValue(story.businessValue);
      setRisk(story.risk);
      setStatus(story.status);
      setIsTDD(story.isTDD);
      setAssignedPair(story.assignedPair);
      setAcceptanceCriteria(story.acceptanceCriteria);
      setCreatedBy(story.createdBy);
      setIteration(story.iteration || '');
    } else {
      // Reset all fields for create mode
      setTitle('');
      setPoints(3);
      setBusinessValue(3);
      setRisk('Low');
      setStatus('Backlog');
      setIsTDD(false);
      setAssignedPair([]);
      setAcceptanceCriteria([]);
      setCreatedBy('Client');
      setIteration('');
      setNewCriteria('');
    }
  }, [story]);

  const handlePairToggle = (name: string) => {
    if (assignedPair.includes(name)) {
      setAssignedPair((prev) => prev.filter((p) => p !== name));
    } else {
      if (assignedPair.length >= 2) {
        // limit to 2 for traditional pairing
        setAssignedPair([assignedPair[1], name]);
      } else {
        setAssignedPair((prev) => [...prev, name]);
      }
    }
  };

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setAcceptanceCriteria((prev) => [...prev, newCriteria.trim()]);
      setNewCriteria('');
    }
  };

  const removeCriteria = (index: number) => {
    setAcceptanceCriteria((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: story?.id,
      title: title.trim(),
      points,
      businessValue,
      risk,
      status,
      isTDD,
      assignedPair,
      acceptanceCriteria,
      createdBy,
      iteration: iteration || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm p-1">
      {/* Title */}
      <div>
        <label
          htmlFor="story-title"
          className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
        >
          Título de la Historia de Usuario
        </label>
        <input
          id="story-title"
          type="text"
          required
          placeholder="Ej. Como cliente, quiero..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
        />
      </div>

      {/* Grid: Points, Business Value, Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Story Points */}
        <div>
          <label
            htmlFor="story-points"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Puntos de Historia (Fibonacci)
          </label>
          <select
            id="story-points"
            value={points}
            disabled={isClientMode}
            onChange={(e) => setPoints(Number(e.target.value))}
            className={`w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none transition-colors ${
              isClientMode ? 'opacity-60 cursor-not-allowed border-indigo-500/20' : ''
            }`}
          >
            {[0, 1, 2, 3, 5, 8, 13, 21].map((p) => (
              <option key={p} value={p}>
                {p} {p === 1 ? 'punto' : 'puntos'}
              </option>
            ))}
          </select>
          {isClientMode && (
            <span className="block text-[10px] text-indigo-400/90 font-mono mt-1">
              🔒 Bloqueado: Se requiere rol de Programador
            </span>
          )}
        </div>

        {/* Business Value */}
        <div>
          <span
            id="story-bv-label"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Valor de Negocio (1-5)
          </span>
          <div
            role="group"
            aria-labelledby="story-bv-label"
            className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2"
          >
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBusinessValue(val)}
                className={`w-7 h-7 rounded-md font-mono font-bold flex items-center justify-center transition-all ${
                  businessValue === val
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Risk */}
        <div>
          <span
            id="story-risk-label"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Evaluación de Riesgo
          </span>
          <div
            role="group"
            aria-labelledby="story-risk-label"
            className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 gap-1"
          >
            {(['Low', 'Medium', 'High'] as const).map((r) => {
              const activeClasses = {
                Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
                Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                High: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
              };
              const isActive = risk === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRisk(r)}
                  className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-all ${
                    isActive ? activeClasses[r] : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {riskLabels[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Status, Iteration, createdBy, isTDD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label
            htmlFor="story-status"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Estado de la Historia
          </label>
          <select
            id="story-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Backlog' | 'Current' | 'Done')}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none transition-colors"
          >
            <option value="Backlog">Backlog (Por hacer)</option>
            <option value="Current">En curso (Esta Iteración)</option>
            <option value="Done">Terminado</option>
          </select>
        </div>

        {/* Iteration */}
        <div>
          <label
            htmlFor="story-iteration"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Iteración
          </label>
          <select
            id="story-iteration"
            value={iteration}
            onChange={(e) => setIteration(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none transition-colors"
          >
            <option value="">Sin iteración</option>
            <option value="iteration-1">Iteración 1</option>
            <option value="iteration-2">Iteración 2</option>
            <option value="iteration-3">Iteración 3</option>
          </select>
        </div>

        {/* Author / Created By */}
        <div>
          <span
            id="story-author-label"
            className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
          >
            Rol Responsable
          </span>
          <div
            role="group"
            aria-labelledby="story-author-label"
            className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 gap-1"
          >
            {(['Client', 'Programmer'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setCreatedBy(role)}
                className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-all border ${
                  createdBy === role
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        {/* TDD Checkbox */}
        <div className="flex items-end pb-1.5">
          <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 w-full hover:border-zinc-700 transition-colors">
            <input
              id="story-tdd"
              type="checkbox"
              checked={isTDD}
              onChange={(e) => setIsTDD(e.target.checked)}
              className="w-4.5 h-4.5 bg-zinc-900 border-zinc-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-950 focus:outline-none cursor-pointer"
            />
            <label htmlFor="story-tdd" className="cursor-pointer select-none">
              <span className="block text-xs font-semibold text-zinc-200">TDD (Primero las pruebas)</span>
              <span className="block text-[10px] text-zinc-500 font-mono">Pruebas escritas antes que el código</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pair Assignment */}
      <div>
        <span
          id="story-pair-label"
          className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
        >
          Asignar Pareja de Programación (Máx 2)
        </span>
        <div
          role="group"
          aria-labelledby="story-pair-label"
          className="flex flex-wrap gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg p-3"
        >
          {teamMembers.map((member) => {
            const isAssigned = assignedPair.includes(member);
            return (
              <button
                key={member}
                type="button"
                onClick={() => handlePairToggle(member)}
                aria-pressed={isAssigned}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isAssigned
                    ? 'bg-violet-500/10 text-violet-300 border-violet-500/40 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                👤 {member}
              </button>
            );
          })}
        </div>
      </div>

      {/* Acceptance Criteria Builder */}
      <div>
        <label
          htmlFor="new-criteria"
          className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
        >
          Criterios de Aceptación (Lista de verificación ejecutable)
        </label>
        <div className="space-y-2.5">
          {/* Criteria list */}
          <ul className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {acceptanceCriteria.map((crit, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 p-2 bg-zinc-950 border border-zinc-900 rounded-lg"
              >
                <span className="text-zinc-300 text-xs font-mono">
                  {index + 1}. {crit}
                </span>
                <button
                  type="button"
                  onClick={() => removeCriteria(index)}
                  className="text-zinc-500 hover:text-rose-400 text-xs px-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </li>
            ))}
            {acceptanceCriteria.length === 0 && (
              <li className="text-xs text-zinc-500 italic p-1">
                Aún no se han agregado criterios de aceptación. ¡Agrega uno abajo!
              </li>
            )}
          </ul>

          {/* Add input */}
          <div className="flex gap-2">
            <input
              id="new-criteria"
              type="text"
              placeholder="Ej. El creador puede cambiar el estado entre backlog y activo"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCriteria();
                }
              }}
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCriteria}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-700/50 hover:border-zinc-600 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all text-xs font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 font-semibold transition-all text-xs"
        >
          Guardar Tarjeta
        </button>
      </div>
    </form>
  );
}
