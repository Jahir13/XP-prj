import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $currentUser } from '../../store/auth';
import {
  $feedbackNotes,
  addFeedbackNote,
  removeFeedbackNote,
  voteFeedbackNote,
  clearFeedbackNotes,
  type FeedbackNote,
} from '../../store/feedback';

const XP_PRACTICES = [
  'Programación en Pareja',
  'Desarrollo Guiado por Pruebas (TDD)',
  'Entregas Pequeñas',
  'Diseño Simple',
  'Refactorización',
  'Metáfora del Sistema',
  'Ritmo Sostenible',
  'Propiedad Colectiva del Código',
  'Estándares de Código',
  'Integración Continua',
  'Juego de la Planificación',
  'Pruebas de Aceptación',
];

const TEAM_MEMBERS = [
  { name: 'Kevin Palacios', role: 'Programmer/Tester', avatar: '💻' },
  { name: 'Jhonathan Pulig', role: 'Programmer/Tester', avatar: '⚡' },
  { name: 'Jahir Rocha', role: 'Gestor', avatar: '👑' },
  { name: 'Christian Puchaicela', role: 'Coach', avatar: '🧠' },
  { name: 'Ariel Rosas', role: 'Cliente', avatar: '💼' },
];

export default function FeedbackRetroXP() {
  const currentUser = useStore($currentUser);
  const notes = useStore($feedbackNotes);

  // Simulation support for testing role compliance
  const [selectedUser, setSelectedUser] = useState(TEAM_MEMBERS[0]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePractice, setNewNotePractice] = useState(XP_PRACTICES[0]);
  const [activeFormCategory, setActiveFormCategory] = useState<'bien' | 'cambios' | 'acciones' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync simulated user with store user if available
  useEffect(() => {
    if (currentUser) {
      const match = TEAM_MEMBERS.find((u) => u.name === currentUser.name);
      if (match) {
        setSelectedUser(match);
      }
    }
  }, [currentUser]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Error auto-clear
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Categories metadata
  const categories = [
    {
      id: 'bien' as const,
      title: 'Salió Bien',
      subtitle: '¿Qué prácticas XP funcionaron de forma sobresaliente?',
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      stickyColor: 'bg-emerald-950/20 border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40',
    },
    {
      id: 'cambios' as const,
      title: 'Requiere Cambios',
      subtitle: '¿Qué bloqueos o deudas técnicas nos alejaron de XP?',
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      stickyColor: 'bg-amber-950/20 border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40',
    },
    {
      id: 'acciones' as const,
      title: 'Acciones a Tomar (XP)',
      subtitle: 'Compromisos de equipo para la siguiente iteración',
      color: 'violet',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      textColor: 'text-violet-400',
      badgeColor: 'bg-violet-500/20 text-violet-300',
      stickyColor: 'bg-violet-950/20 border-violet-500/20 shadow-violet-500/5 hover:border-violet-500/40',
    },
  ];

  // Group and sort notes by category and votes count desc
  const groupedNotes = useMemo(() => {
    const map = {
      bien: [] as FeedbackNote[],
      cambios: [] as FeedbackNote[],
      acciones: [] as FeedbackNote[],
    };
    notes.forEach((note) => {
      if (map[note.category]) {
        map[note.category].push(note);
      }
    });
    // Sort descending by votes
    map.bien.sort((a, b) => b.votes - a.votes);
    map.cambios.sort((a, b) => b.votes - a.votes);
    map.acciones.sort((a, b) => b.votes - a.votes);
    return map;
  }, [notes]);

  // Calculate dynamic XP statistics
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalVotes = notes.reduce((sum, n) => sum + n.votes, 0);
    const approvedActions = notes.filter((n) => n.category === 'acciones' && n.votes >= 2).length;

    // Adhesion to standard XP practices
    const withXP = notes.filter((n) => XP_PRACTICES.includes(n.practice)).length;
    const xpAdhesion = totalNotes > 0 ? Math.round((withXP / totalNotes) * 100) : 0;

    // Role contribution breakdown
    const rolesCount: Record<string, number> = {};
    notes.forEach((n) => {
      const member = TEAM_MEMBERS.find((tm) => tm.name === n.author);
      const role = member ? member.role : 'Miembro';
      rolesCount[role] = (rolesCount[role] || 0) + 1;
    });

    // Most active practice
    const practiceCounts: Record<string, number> = {};
    notes.forEach((n) => {
      practiceCounts[n.practice] = (practiceCounts[n.practice] || 0) + 1;
    });
    let topPractice = 'Ninguna';
    let maxPracticeCount = 0;
    Object.entries(practiceCounts).forEach(([practice, count]) => {
      if (count > maxPracticeCount) {
        maxPracticeCount = count;
        topPractice = practice;
      }
    });

    return {
      totalNotes,
      totalVotes,
      approvedActions,
      xpAdhesion,
      topPractice,
      rolesCount,
    };
  }, [notes]);

  // Approved actions list (votes >= 2)
  const approvedActionItems = useMemo(() => {
    return notes.filter((n) => n.category === 'acciones' && n.votes >= 2);
  }, [notes]);

  // Handle adding a new note with role restrictions
  const handleSubmitNote = (category: 'bien' | 'cambios' | 'acciones') => {
    if (!newNoteContent.trim()) {
      setErrorMsg('El contenido de la nota no puede estar vacío.');
      return;
    }

    // Role restrictions for Acciones a Tomar (category: 'acciones')
    if (category === 'acciones') {
      const allowedRoles = ['Coach', 'Gestor', 'Programmer/Tester'];
      if (!allowedRoles.includes(selectedUser.role)) {
        setErrorMsg(
          `Acceso denegado: El miembro '${selectedUser.name}' tiene rol '${selectedUser.role}'. Solo el Entrenador (Coach), Gestor y los Programadores/Testers pueden definir Acciones XP.`,
        );
        return;
      }
    }

    addFeedbackNote({
      category,
      content: newNoteContent.trim(),
      author: selectedUser.name,
      practice: newNotePractice,
    });

    setNewNoteContent('');
    setActiveFormCategory(null);
    setToastMsg('¡Nota agregada correctamente!');
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# Reporte de Retrospectiva XP-Flow\n`;
    md += `**Fecha:** ${today}\n`;
    md += `**Metáfora de Proyecto:** Secretario Inteligente de Reuniones\n`;
    md += `**Adherencia a Prácticas XP:** ${stats.xpAdhesion}%\n`;
    md += `**Total de Notas:** ${stats.totalNotes} | **Total de Votos:** ${stats.totalVotes}\n\n`;

    md += `## 📊 Múltiples Métricas de Desempeño\n`;
    md += `| Métrica | Valor |\n`;
    md += `| --- | --- |\n`;
    md += `| Adherencia General a XP | ${stats.xpAdhesion}% |\n`;
    md += `| Notas Totales | ${stats.totalNotes} |\n`;
    md += `| Votos Emitidos | ${stats.totalVotes} |\n`;
    md += `| Acciones Comprometidas Aprobadas (>= 2 votos) | ${stats.approvedActions} |\n`;
    md += `| Práctica XP Más Discutida | ${stats.topPractice} |\n\n`;

    md += `## 🟢 Salió Bien\n`;
    if (groupedNotes.bien.length === 0) md += `*No se registraron notas en esta categoría.*\n`;
    groupedNotes.bien.forEach((n) => {
      md += `- **[${n.practice}]** ${n.content} (Por: *${n.author}*, 👍 ${n.votes} votos)\n`;
    });
    md += `\n`;

    md += `## 🟡 Requiere Cambios\n`;
    if (groupedNotes.cambios.length === 0) md += `*No se registraron notas en esta categoría.*\n`;
    groupedNotes.cambios.forEach((n) => {
      md += `- **[${n.practice}]** ${n.content} (Por: *${n.author}*, 👍 ${n.votes} votos)\n`;
    });
    md += `\n`;

    md += `## 🟣 Acciones a Tomar (XP)\n`;
    if (groupedNotes.acciones.length === 0) md += `*No se registraron notas en esta categoría.*\n`;
    groupedNotes.acciones.forEach((n) => {
      const isApproved = n.votes >= 2 ? '[x]' : '[ ]';
      md += `- ${isApproved} **[${n.practice}]** ${n.content} (Por: *${n.author}*, 👍 ${n.votes} votos) ${n.votes >= 2 ? '⚠️ COMPROMISO APROBADO' : ''}\n`;
    });
    md += `\n`;

    md += `## 🚀 Compromisos XP para el Siguiente Ciclo (Aprobados >= 2 votos)\n`;
    if (approvedActionItems.length === 0) {
      md += `*No hay acciones que hayan alcanzado el umbral de 2 votos mínimos para ser aprobadas.*\n`;
    } else {
      approvedActionItems.forEach((n) => {
        md += `- [x] **[${n.practice}]** ${n.content} (Responsable Inicial: *${n.author}*, 👍 ${n.votes} votos)\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retrospectiva-xp-flow-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMsg('¡Retrospectiva exportada a Markdown!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-indigo-600 border border-indigo-400 text-white px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span className="font-bold">✓</span>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2.5 shadow-lg animate-pulse">
          <span className="text-base leading-none">⚠️</span>
          <div className="space-y-0.5">
            <p className="font-bold">Restricción de Rol Activada</p>
            <p className="font-normal text-rose-400/80 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Retro Header Citation */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-mono text-[9px] font-bold uppercase tracking-wider">
              Retroalimentación Correctiva Rápida (XP)
            </span>
            <h2 className="text-lg font-bold text-zinc-100">Retrospectiva de Calidad XP</h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
              "El feedback rápido y el ajuste fino continuo son el motor de un equipo ágil. Esta retrospectiva nos
              permite evaluar nuestras prácticas en cada iteración y acordar acciones correctoras inmediatas que mejoren
              la salud técnica de nuestro <strong>Secretario Inteligente de Reuniones</strong>."
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-md shadow-indigo-500/10 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar Reporte (.md)
            </button>
            <button
              onClick={() => {
                if (confirm('¿Restablecer el tablero de retrospectiva a los datos semilla canónicos?')) {
                  clearFeedbackNotes();
                  setToastMsg('Tablero restablecido.');
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-sans text-xs font-semibold cursor-pointer transition-all"
            >
              Reiniciar Semilla
            </button>
          </div>
        </div>

        {/* Team Role Simulator Helper */}
        <div className="border-t border-zinc-800/50 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold font-mono uppercase text-[10px]">
              Simulador de Miembro Activo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEAM_MEMBERS.map((tm) => (
                <button
                  key={tm.name}
                  onClick={() => {
                    setSelectedUser(tm);
                    setToastMsg(`Simulando a ${tm.name} (${tm.role})`);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-all flex items-center gap-1.5 text-[10px] ${
                    selectedUser.name === tm.name
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <span>{tm.avatar}</span>
                  <span>{tm.name}</span>
                  <span className="text-[8px] opacity-60 font-mono">({tm.role.split('/')[0]})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded bg-zinc-950/50 border border-zinc-850 flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] font-mono">Permisos del Rol:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                ['Coach', 'Gestor', 'Programmer/Tester'].includes(selectedUser.role)
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
              }`}
            >
              {['Coach', 'Gestor', 'Programmer/Tester'].includes(selectedUser.role)
                ? 'Escribe Acciones XP ✓'
                : 'Solo Lectura de Acciones 🔒'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Board & Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Kanban Board Columns (3 Columns) */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4.5">
          {categories.map((col) => {
            const colNotes = groupedNotes[col.id];
            const isFormOpen = activeFormCategory === col.id;

            return (
              <div
                key={col.id}
                className="flex flex-col min-h-[500px] rounded-xl border border-zinc-850 bg-zinc-950/40 p-4 space-y-4"
              >
                {/* Column Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          col.id === 'bien' ? 'bg-emerald-400' : col.id === 'cambios' ? 'bg-amber-400' : 'bg-violet-400'
                        }`}
                      />
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">{col.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${col.badgeColor}`}>
                        {colNotes.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">{col.subtitle}</p>
                  </div>
                </div>

                {/* Add Note Button or Inline Form */}
                {isFormOpen ? (
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl animate-[slide-up_0.15s_ease-out]">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`content-${col.id}`}
                        className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 font-mono"
                      >
                        Contenido del Post-it:
                      </label>
                      <textarea
                        id={`content-${col.id}`}
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder={
                          col.id === 'bien'
                            ? 'Ej: Gran integración continua de los módulos...'
                            : col.id === 'cambios'
                              ? 'Ej: Hay deuda técnica acumulada en la base...'
                              : 'Ej: Migrar a IndexedDB para evadir cuotas...'
                        }
                        className="w-full h-20 p-2.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor={`practice-${col.id}`}
                        className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 font-mono"
                      >
                        Práctica XP Asociada:
                      </label>
                      <select
                        id={`practice-${col.id}`}
                        value={newNotePractice}
                        onChange={(e) => setNewNotePractice(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1"
                      >
                        {XP_PRACTICES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => {
                          setActiveFormCategory(null);
                          setNewNoteContent('');
                        }}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSubmitNote(col.id)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                      >
                        Guardar Nota
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveFormCategory(col.id);
                      setErrorMsg(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/30 text-zinc-500 hover:text-zinc-400 transition-all font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>+</span>
                    <span>Agregar Nota</span>
                  </button>
                )}

                {/* Sticky Notes List */}
                <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colNotes.length === 0 ? (
                    <div className="h-40 border border-dashed border-zinc-850/60 rounded-xl flex items-center justify-center text-center p-4">
                      <span className="text-[10px] font-mono text-zinc-600">
                        No hay notas en esta columna. ¡Haz clic arriba para agregar una!
                      </span>
                    </div>
                  ) : (
                    colNotes.map((note) => {
                      const userAvatar = TEAM_MEMBERS.find((tm) => tm.name === note.author)?.avatar || '👤';
                      const hasVoted = note.votedBy.includes(selectedUser.name);

                      return (
                        <div
                          key={note.id}
                          className={`p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-200 group relative ${col.stickyColor}`}
                        >
                          {/* Close button for removal */}
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta nota de retrospectiva?')) {
                                removeFeedbackNote(note.id);
                                setToastMsg('Nota eliminada.');
                              }
                            }}
                            className="absolute top-2 right-2 p-1 rounded bg-zinc-950/20 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all text-[8px] cursor-pointer"
                            title="Eliminar nota"
                            aria-label="Eliminar nota"
                          >
                            ✕
                          </button>

                          {/* Content */}
                          <p className="text-xs text-zinc-200 font-medium leading-relaxed select-text pr-3">
                            {note.content}
                          </p>

                          {/* Metadata */}
                          <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-5 h-5 rounded-full bg-zinc-850 flex items-center justify-center text-[10px] shadow"
                                title={note.author}
                              >
                                {userAvatar}
                              </span>
                              <div className="text-[9px]">
                                <p className="font-semibold text-zinc-400 leading-none">{note.author}</p>
                                <p className="text-zinc-600 text-[8px] font-mono mt-0.5">{note.practice}</p>
                              </div>
                            </div>

                            {/* Votes count and Thumbs-up toggle */}
                            <button
                              onClick={() => {
                                voteFeedbackNote(note.id, selectedUser.name);
                              }}
                              className={`px-2 py-1 rounded-lg border font-mono text-[9px] flex items-center gap-1.5 transition-all cursor-pointer ${
                                hasVoted
                                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 font-bold shadow shadow-indigo-500/5 scale-105'
                                  : 'bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                              }`}
                              title={hasVoted ? 'Quitar voto' : 'Votar nota'}
                            >
                              <span>👍</span>
                              <span>{note.votes}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quantitative Team Performance Metrics Sidebar */}
        <div className="xl:col-span-1 space-y-5.5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Métricas de Desempeño</h3>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Analíticas retrospectivas cuantitativas de XP</p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Adherencia Metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-zinc-400 font-semibold">Adherencia a Prácticas XP:</span>
                  <span className="text-indigo-400 font-bold">{stats.xpAdhesion}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
                    style={{ width: `${stats.xpAdhesion}%` }}
                  />
                </div>
                <p className="text-[8.5px] text-zinc-500 leading-normal">
                  Porcentaje de reflexiones asociadas directamente a prácticas canónicas de XP.
                </p>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800/40">
                <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-850 text-center">
                  <span className="block text-[8px] font-mono uppercase tracking-wider text-zinc-500">
                    Notas Totales
                  </span>
                  <span className="text-base font-bold text-zinc-300 mt-1 block">{stats.totalNotes}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-850 text-center">
                  <span className="block text-[8px] font-mono uppercase tracking-wider text-zinc-500">
                    Votos Totales
                  </span>
                  <span className="text-base font-bold text-zinc-300 mt-1 block">{stats.totalVotes}</span>
                </div>
              </div>

              {/* Top Practice */}
              <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-850 space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">
                  Área de Enfoque Principal:
                </span>
                <span className="text-[10px] font-bold text-indigo-400 block truncate">{stats.topPractice}</span>
              </div>

              {/* Roles Contribution Breakdown Chart */}
              <div className="pt-2 border-t border-zinc-800/40 space-y-2">
                <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider">
                  Aporte por Rol de Equipo:
                </span>
                <div className="space-y-2 font-mono text-[9px] text-zinc-400">
                  {Object.entries(stats.rolesCount).length === 0 ? (
                    <p className="text-[8.5px] text-zinc-600">Sin notas aún.</p>
                  ) : (
                    Object.entries(stats.rolesCount).map(([role, count]) => {
                      const percentage = Math.round((count / stats.totalNotes) * 100);
                      const barColor =
                        role === 'Coach'
                          ? 'bg-amber-400'
                          : role === 'Gestor'
                            ? 'bg-cyan-400'
                            : role === 'Cliente'
                              ? 'bg-emerald-400'
                              : 'bg-indigo-400';

                      return (
                        <div key={role} className="space-y-0.5">
                          <div className="flex justify-between">
                            <span className="truncate max-w-[120px]">{role}</span>
                            <span className="font-bold">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1 bg-zinc-850 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Approved Actions XP (votes >= 2) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Acciones Comprometidas del Equipo (Aprobadas)</h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Tarjetas de "Acciones a Tomar" que han superado el quórum mínimo de 2 votos de conformidad
          </p>
        </div>

        {approvedActionItems.length === 0 ? (
          <div className="py-6 rounded-lg bg-zinc-950/40 border border-dashed border-zinc-850 flex flex-col items-center justify-center text-center p-4">
            <span className="text-xl">🗳️</span>
            <p className="text-xs font-semibold text-zinc-500 mt-2">No hay compromisos aprobados aún.</p>
            <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
              Las notas en la columna "Acciones a Tomar" necesitan al menos 2 votos 👍 para consolidarse.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedActionItems.map((note) => {
              const userAvatar = TEAM_MEMBERS.find((tm) => tm.name === note.author)?.avatar || '👤';

              return (
                <div
                  key={note.id}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-emerald-500/10 shadow shadow-emerald-500/2 flex items-start gap-3 relative animate-[slide-up_0.2s_ease-out]"
                >
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                    ✓
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed truncate-2-lines">{note.content}</p>
                    <div className="flex items-center justify-between gap-2 text-[9px] border-t border-zinc-850 pt-2 mt-1">
                      <div className="flex items-center gap-1 truncate text-zinc-400">
                        <span>{userAvatar}</span>
                        <span className="truncate">{note.author}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[8px] font-bold uppercase truncate max-w-[100px]">
                        {note.practice}
                      </span>
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded font-mono text-[8px] font-bold px-1">
                    👍 {note.votes}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
