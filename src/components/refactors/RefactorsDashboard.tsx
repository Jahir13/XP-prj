import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeLogs, addLog, updateLogStatus } from '../../store/logs';
import { $runtimeStories } from '../../store/stories';
import { $currentUser } from '../../store/auth';

const TEAM_MEMBERS = [
  'Christian Puchaicela',
  'Ariel Rosas',
  'Jahir Rocha',
  'Kevin Palacios',
  'Jhonathan Pulig',
  'Santiago Pinta',
];

const priorityTranslations: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};

const typeTranslations: Record<string, string> = {
  debt: 'Deuda',
  refactor: 'Refactor',
};

export default function RefactorsDashboard() {
  const logs = useStore($runtimeLogs);
  const stories = useStore($runtimeStories);
  const currentUser = useStore($currentUser);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'debt' | 'refactor'>('debt');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [relatedStory, setRelatedStory] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Filter toolbar states
  const [storyFilter, setStoryFilter] = useState('All');

  // Expanded traceability states per item ID
  const [expandedTraceability, setExpandedTraceability] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter refactoring logs
  const debtItems = useMemo(() => {
    return logs.filter((l) => l.type === 'debt' || l.type === 'refactor');
  }, [logs]);

  // Compute live available story IDs from logs and stories
  const availableStories = useMemo(() => {
    const ids = new Set<string>();
    ids.add('HU-03');
    ids.add('HU-04');
    ids.add('HU-05');
    stories.forEach((s) => {
      if (s.id) ids.add(s.id.toUpperCase());
    });
    debtItems.forEach((d) => {
      const storyId = d.historiaId || d.relatedStory;
      if (storyId) ids.add(storyId.toUpperCase());
    });
    return Array.from(ids).sort();
  }, [stories, debtItems]);

  // Filter items by storyId
  const filteredDebtItems = useMemo(() => {
    return debtItems.filter((item) => {
      if (storyFilter === 'All') return true;
      const storyId = item.historiaId || item.relatedStory || '';
      return storyId.toUpperCase() === storyFilter.toUpperCase();
    });
  }, [debtItems, storyFilter]);

  // Compute Codebase Health Score
  const healthMetrics = useMemo(() => {
    let score = 100;
    let openCount = 0;
    let resolvedCount = 0;

    debtItems.forEach((item) => {
      if (item.status === 'Open') {
        openCount++;
        const isHigh =
          item.title.toLowerCase().includes('duplicación') ||
          item.title.toLowerCase().includes('card') ||
          item.title.toLowerCase().includes('shared');
        const isMedium =
          item.title.toLowerCase().includes('nanostores') ||
          item.title.toLowerCase().includes('store') ||
          item.title.toLowerCase().includes('initialization');

        if (isHigh) score -= 20;
        else if (isMedium) score -= 10;
        else score -= 5;
      } else {
        resolvedCount++;
      }
    });

    return {
      score: Math.max(0, score),
      openCount,
      resolvedCount,
    };
  }, [debtItems]);

  // Refactoring advice from XP Coach Christian
  const coachAdvice = useMemo(() => {
    const openDebts = debtItems.filter((d) => d.status === 'Open');
    if (openDebts.length === 0) {
      return {
        title: '¡Excelente Salud del Código!',
        desc: 'Toda la deuda técnica está resuelta. Mantén este ritmo refactorizando de manera despiadada junto con TDD.',
      };
    }

    const highPriority = openDebts.find(
      (d) =>
        d.title.toLowerCase().includes('duplicación') ||
        d.title.toLowerCase().includes('card') ||
        d.title.toLowerCase().includes('shared'),
    );
    if (highPriority) {
      return {
        title: 'Alto Riesgo: Duplicación en lógica de grabación',
        desc: `Refactorice la deuda técnica abierta "${highPriority.title}" de inmediato. Considere emparejar a Kevin Palacios y Christian Puchaicela para resolver esto.`,
      };
    }

    const midPriority = openDebts[0];
    return {
      title: 'Acción Pendiente: Refactorizar Deuda',
      desc: `El registro "${midPriority.title}" está actualmente abierto. Reserve el 20% de la capacidad de la iteración para refactorizar este bloque de código.`,
    };
  }, [debtItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (currentUser?.role !== 'Programmer/Tester') {
      setRoleError(
        'Acceso Denegado: Solo los programadores/testers autorizados pueden registrar nuevas deudas técnicas.',
      );
      setTimeout(() => setRoleError(null), 4000);
      return;
    }

    addLog({
      title,
      type,
      status: 'Open',
      relatedStory: relatedStory || undefined,
      participants: selectedParticipants.length > 0 ? selectedParticipants : undefined,
    });

    // Reset Form
    setTitle('');
    setRelatedStory('');
    setSelectedParticipants([]);
    setIsFormOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: 'Open' | 'Resolved') => {
    // Only Programmer/Tester (Kevin, Jhonathan) can resolve debt
    if (currentUser?.role !== 'Programmer/Tester') {
      setRoleError(
        'Acceso Denegado: Solo los programadores/testers autorizados (Kevin Palacios o Jhonathan Pulig) pueden resolver o reabrir deuda técnica.',
      );
      setTimeout(() => setRoleError(null), 4000);
      return;
    }

    const nextStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
    updateLogStatus(id, nextStatus);
  };

  const toggleParticipant = (member: string) => {
    if (selectedParticipants.includes(member)) {
      setSelectedParticipants((prev) => prev.filter((m) => m !== member));
    } else {
      setSelectedParticipants((prev) => [...prev, member]);
    }
  };

  const toggleTraceability = (id: string) => {
    setExpandedTraceability((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Refactorización y Deuda Técnica</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Refactorización Despiadada y Diseño Simple
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
        >
          {isFormOpen ? 'Cerrar Formulario' : 'Registrar Deuda Técnica'}
        </button>
      </div>

      {roleError && (
        <div className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg animate-pulse">
          ⚠️ {roleError}
        </div>
      )}

      {/* Story Filtering Toolbar */}
      <div className="flex items-center gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
        <label htmlFor="story-filter" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Filtrar por Historia:
        </label>
        <select
          id="story-filter"
          value={storyFilter}
          onChange={(e) => setStoryFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
        >
          <option value="All">Todas las Historias</option>
          {availableStories.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Score & Coach Advice */}
        <div className="lg:col-span-1 space-y-6">
          {/* Health score gauge */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 w-full text-left">Grado de Salud del Código</h3>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-zinc-800" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-1000 ${
                    healthMetrics.score >= 80
                      ? 'stroke-emerald-500'
                      : healthMetrics.score >= 50
                        ? 'stroke-indigo-500'
                        : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * healthMetrics.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-zinc-100">{healthMetrics.score}</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  Puntos de Salud
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-mono text-zinc-400">
              <div>
                <strong className="text-rose-400">{healthMetrics.openCount}</strong> Abiertas
              </div>
              <div className="text-zinc-600">|</div>
              <div>
                <strong className="text-emerald-400">{healthMetrics.resolvedCount}</strong> Resueltas
              </div>
            </div>
          </div>

          {/* Coach Advice */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧙‍♀️</span>
              <h3 className="text-sm font-semibold text-zinc-200">Directiva de Refactorización del Coach</h3>
            </div>
            <div className="p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-300 font-mono">{coachAdvice.title}</h4>
              <p className="text-[10px] text-zinc-400 leading-normal font-mono">{coachAdvice.desc}</p>
            </div>
          </div>
        </div>

        {/* Right Columns: Register list & New log Form popup */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Debt Form Card */}
          {isFormOpen && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <h3 className="text-sm font-semibold text-zinc-200">Registrar Nueva Deuda Técnica</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="refactor-title"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Título del Registro
                    </label>
                    <input
                      id="refactor-title"
                      type="text"
                      placeholder="Ej. Extraer diseños de tarjetas compartidos"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refactor-type"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Tipo de Registro
                    </label>
                    <select
                      id="refactor-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as 'debt' | 'refactor')}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="debt">Deuda Técnica</option>
                      <option value="refactor">Tarea de Refactorización</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="refactor-priority"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Prioridad
                    </label>
                    <select
                      id="refactor-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="Low">Baja (Mantenimiento trivial)</option>
                      <option value="Medium">Media (Afecta la velocidad)</option>
                      <option value="High">Alta (Afecta calidad/estabilidad)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="refactor-story"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Historia de Usuario Relacionada
                    </label>
                    <select
                      id="refactor-story"
                      value={relatedStory}
                      onChange={(e) => setRelatedStory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="">Ninguna historia específica</option>
                      {stories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span
                    id="refactor-participants-label"
                    className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                  >
                    Identificado Por
                  </span>
                  <div role="group" aria-labelledby="refactor-participants-label" className="flex flex-wrap gap-2">
                    {TEAM_MEMBERS.map((member) => {
                      const isSelected = selectedParticipants.includes(member);
                      return (
                        <button
                          key={member}
                          type="button"
                          onClick={() => toggleParticipant(member)}
                          aria-pressed={isSelected}
                          className={`px-2.5 py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-semibold'
                              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {member.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition-colors cursor-pointer"
                  >
                    Registrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Refactoring Register List */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-300">Registro de Deuda Técnica</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {filteredDebtItems.filter((i) => i.status === 'Open').length} tareas abiertas
              </span>
            </div>

            <div className="divide-y divide-zinc-800/50 max-h-[700px] overflow-y-auto">
              {filteredDebtItems.map((item) => {
                const priorityLabel =
                  item.prioridad ||
                  (item.title.toLowerCase().includes('duplicación') ||
                  item.title.toLowerCase().includes('card') ||
                  item.title.toLowerCase().includes('shared')
                    ? 'High'
                    : item.title.toLowerCase().includes('nanostores') ||
                        item.title.toLowerCase().includes('store') ||
                        item.title.toLowerCase().includes('initialization')
                      ? 'Medium'
                      : 'Low');

                let priorityBadgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

                if (priorityLabel === 'High' || priorityLabel === 'Alta') {
                  priorityBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                } else if (priorityLabel === 'Medium' || priorityLabel === 'Media') {
                  priorityBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                }

                const displayId = item.id.toUpperCase();
                const relatedStoryId = item.historiaId || item.relatedStory;
                const isTraceabilityOpen = !!expandedTraceability[item.id];
                const isEnCurso = item.estado === 'En Curso';

                return (
                  <div key={item.id} className="hover:bg-zinc-800/10 transition-colors">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-500/20 border-emerald-500/40'
                              : 'border-zinc-600 hover:border-zinc-500'
                          }`}
                        >
                          {item.status === 'Resolved' && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-emerald-400"
                              aria-hidden="true"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              item.status === 'Resolved' ? 'text-zinc-500 line-through' : 'text-zinc-200'
                            }`}
                          >
                            [{displayId}] {item.title}
                          </span>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                item.type === 'debt'
                                  ? 'bg-rose-500/5 text-rose-400/90 border border-rose-500/10'
                                  : 'bg-amber-500/5 text-amber-400/90 border border-amber-500/10'
                              }`}
                            >
                              {typeTranslations[item.type] || item.type}
                            </span>

                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${priorityBadgeColor}`}>
                              {priorityTranslations[priorityLabel] || priorityLabel}
                            </span>

                            {relatedStoryId && (
                              <span className="text-[9px] font-mono text-zinc-500">→ historia: {relatedStoryId}</span>
                            )}

                            {/* Clickable Traceability Badge */}
                            {(item.githubRepo ||
                              (item.githubFiles && item.githubFiles.length > 0) ||
                              item.codeSnippet) && (
                              <button
                                onClick={() => toggleTraceability(item.id)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border font-semibold cursor-pointer transition-all ${
                                  isEnCurso
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700'
                                }`}
                              >
                                🔗 GitHub
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        {item.participants && item.participants.length > 0 && (
                          <div className="flex gap-0.5 text-[8px] font-mono text-zinc-400">
                            {item.participants.map((p) => (
                              <span key={p} className="px-1 rounded bg-zinc-800" title={p}>
                                {p.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Collapsable Traceability Details Section */}
                    {isTraceabilityOpen && (
                      <div className="px-5 pb-5 pt-1 bg-zinc-950/40 border-t border-zinc-800/30 animate-[slide-down_0.20s_ease-out]">
                        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-4 text-left">
                          {/* BLOQUE PRINCIPAL: Link al repositorio */}
                          {item.githubRepo && (
                            <div className="flex items-center justify-between">
                              <a
                                href={item.githubRepo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                              >
                                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                Ver repositorio completo
                              </a>
                              <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                M-A_Proyecto_PB
                              </span>
                            </div>
                          )}

                          {/* LISTA DE ARCHIVOS RELACIONADOS */}
                          {item.githubFiles && item.githubFiles.length > 0 && (
                            <div className="space-y-2.5 border-t border-zinc-850 pt-3">
                              <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                                Archivos Relacionados
                              </span>
                              <div className="space-y-2">
                                {item.githubFiles.map((file, fIdx) => {
                                  const urlWithLine =
                                    file.lineStart && file.lineEnd
                                      ? `${file.githubUrl}#L${file.lineStart}-L${file.lineEnd}`
                                      : file.githubUrl;

                                  return (
                                    <div
                                      key={fIdx}
                                      className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium font-mono text-[11px]">
                                          <span>📄</span>
                                          <span>{file.path}</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed">{file.description}</p>
                                      </div>
                                      <a
                                        href={urlWithLine}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex-shrink-0"
                                      >
                                        Ver en GitHub →
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SNIPPET DE CÓDIGO */}
                          {item.codeSnippet && (
                            <div className="space-y-2 border-t border-zinc-850 pt-3">
                              <div className="flex items-center justify-between">
                                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                                  Fragmento de Código
                                </span>
                                <button
                                  onClick={() => handleCopyCode(item.id, item.codeSnippet || '')}
                                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-[10px] font-medium transition-colors cursor-pointer"
                                >
                                  {copiedId === item.id ? '¡Copiado! ✓' : 'Copiar'}
                                </button>
                              </div>
                              <pre className="p-3 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-w-full">
                                <code>{item.codeSnippet}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredDebtItems.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-zinc-500">
                  🎉 No se encontraron registros de refactorización ni deuda técnica para esta historia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
