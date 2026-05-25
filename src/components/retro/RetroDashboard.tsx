import { useState, useEffect } from 'react';

interface StickyNote {
  id: string;
  category: 'well' | 'change' | 'action';
  content: string;
  author: string;
  votes: number;
  color: 'green' | 'amber' | 'indigo' | 'violet';
}

const TEAM_MEMBERS = [
  'Christian Puchaicela',
  'Ariel Rosas',
  'Jahir Rocha',
  'Kevin Palacios',
  'Jhonathan Pulig',
  'Santiago Pinta',
];

export default function RetroDashboard() {
  // Load notes from localStorage on mount
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('xp_retro_notes');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed default cards
    return [
      {
        id: '1',
        category: 'well',
        content:
          'El ritmo de rotación de la programación en pareja ha sido muy fluido; la rotación diaria funcionó excelente.',
        author: 'Kevin Palacios',
        votes: 4,
        color: 'green',
      },
      {
        id: '2',
        category: 'well',
        content:
          'TDD detecta los errores de lógica en las historias ANTES de que siquiera escribamos los estilos visuales.',
        author: 'Jhonathan Pulig',
        votes: 5,
        color: 'green',
      },
      {
        id: '3',
        category: 'change',
        content:
          'Las estimaciones del cliente en el Juego de Planeación superan la capacidad; los umbrales de puntos de historia son demasiado altos.',
        author: 'Ariel Rosas',
        votes: 3,
        color: 'amber',
      },
      {
        id: '4',
        category: 'action',
        content:
          'Programar revisiones estrictas sobre el Ritmo Sostenible de 40 horas los viernes para evitar la fatiga en el equipo.',
        author: 'Christian Puchaicela',
        votes: 6,
        color: 'indigo',
      },
    ];
  });

  // Save notes on change
  useEffect(() => {
    localStorage.setItem('xp_retro_notes', JSON.stringify(notes));
  }, [notes]);

  // Form states
  const [activeFormCategory, setActiveFormCategory] = useState<'well' | 'change' | 'action' | null>(null);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(TEAM_MEMBERS[0]);
  const [color, setColor] = useState<'green' | 'amber' | 'indigo' | 'violet'>('indigo');

  const handleAddNote = (category: 'well' | 'change' | 'action') => {
    if (!content.trim()) return;

    const newNote: StickyNote = {
      id: `retro-note-${Date.now()}`,
      category,
      content,
      author,
      votes: 0,
      color,
    };

    setNotes((prev) => [...prev, newNote]);
    setContent('');
    setActiveFormCategory(null);
  };

  const handleVote = (id: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, votes: note.votes + 1 } : note)));
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  // Compile all columns to markdown
  const exportRetroToMarkdown = () => {
    const wellNotes = notes.filter((n) => n.category === 'well').sort((a, b) => b.votes - a.votes);
    const changeNotes = notes.filter((n) => n.category === 'change').sort((a, b) => b.votes - a.votes);
    const actionNotes = notes.filter((n) => n.category === 'action').sort((a, b) => b.votes - a.votes);

    const formatSection = (title: string, items: StickyNote[]) => {
      let md = `### ${title}\n\n`;
      if (items.length === 0) md += `*No se registraron tarjetas en esta columna.*\n`;
      items.forEach((item) => {
        md += `- **[${item.author}]** ${item.content} (👍 ${item.votes} votos)\n`;
      });
      return md + '\n';
    };

    const markdownContent = `---
type: "retrospective"
title: "Registro de Retrospectiva de Planeación de Iteración"
date: ${new Date().toISOString().split('T')[0]}
---

## Retrospectiva de Planeación de Iteración

${formatSection('🟢 Lo que salió bien (Victorias)', wellNotes)}
${formatSection('🟡 Lo que requiere cambios (Impedimentos)', changeNotes)}
${formatSection('🔵 Acciones XP (Tareas)', actionNotes)}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retrospectiva-iteracion-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Retrospectivas de Planeación</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Retrospectivas y Ciclos de Retroalimentación Sostenibles
          </p>
        </div>
        <button
          onClick={exportRetroToMarkdown}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
        >
          Exportar Retro MD
        </button>
      </div>

      {/* Retrospective Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: WENT WELL */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Salió Bien</h3>
            </div>
            <button
              onClick={() => {
                setActiveFormCategory(activeFormCategory === 'well' ? null : 'well');
                setColor('green');
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          {activeFormCategory === 'well' && (
            <div className="p-3 mb-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3 animate-[slide-up_0.2s_ease-out]">
              <textarea
                placeholder="¿Qué hicimos bien?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-16 p-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="flex-1 px-2 py-1 text-[10px] rounded bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddNote('well')}
                  className="px-3 py-1 text-[10px] font-semibold rounded bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {notes
              .filter((n) => n.category === 'well')
              .map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-md p-4 relative group shadow-sm"
                >
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="absolute top-2 right-2 p-1 text-[10px] text-zinc-500 hover:text-zinc-300 hidden group-hover:block transition-colors cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{note.content}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] font-mono font-semibold text-zinc-400">
                      👤 {note.author.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => handleVote(note.id)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-mono text-[10px]"
                    >
                      👍 {note.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: NEEDS CHANGE */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Requiere Cambios</h3>
            </div>
            <button
              onClick={() => {
                setActiveFormCategory(activeFormCategory === 'change' ? null : 'change');
                setColor('amber');
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 font-mono cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          {activeFormCategory === 'change' && (
            <div className="p-3 mb-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3 animate-[slide-up_0.2s_ease-out]">
              <textarea
                placeholder="¿Qué cuellos de botella o problemas enfrentamos?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-16 p-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="flex-1 px-2 py-1 text-[10px] rounded bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddNote('change')}
                  className="px-3 py-1 text-[10px] font-semibold rounded bg-amber-500 hover:bg-amber-400 text-white cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {notes
              .filter((n) => n.category === 'change')
              .map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-amber-500/10 bg-amber-500/5 backdrop-blur-md p-4 relative group shadow-sm"
                >
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="absolute top-2 right-2 p-1 text-[10px] text-zinc-500 hover:text-zinc-300 hidden group-hover:block transition-colors cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{note.content}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] font-mono font-semibold text-zinc-400">
                      👤 {note.author.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => handleVote(note.id)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-mono text-[10px]"
                    >
                      👍 {note.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: ACTION ITEMS */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Acciones a Tomar</h3>
            </div>
            <button
              onClick={() => {
                setActiveFormCategory(activeFormCategory === 'action' ? null : 'action');
                setColor('indigo');
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          {activeFormCategory === 'action' && (
            <div className="p-3 mb-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3 animate-[slide-up_0.2s_ease-out]">
              <textarea
                placeholder="¿Qué medidas o acciones concretas tomaremos?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-16 p-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="flex-1 px-2 py-1 text-[10px] rounded bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddNote('action')}
                  className="px-3 py-1 text-[10px] font-semibold rounded bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {notes
              .filter((n) => n.category === 'action')
              .map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md p-4 relative group shadow-sm"
                >
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="absolute top-2 right-2 p-1 text-[10px] text-zinc-500 hover:text-zinc-300 hidden group-hover:block transition-colors cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{note.content}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] font-mono font-semibold text-zinc-400">
                      👤 {note.author.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => handleVote(note.id)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-mono text-[10px]"
                    >
                      👍 {note.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
