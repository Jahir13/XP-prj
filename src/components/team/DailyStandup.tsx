import { useState, useEffect } from 'react';

interface Member {
  name: string;
  role: string;
}

interface StandupEntry {
  date: string;
  speaker: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export default function DailyStandup({ team }: { team: Member[] }) {
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number | null>(null);
  const [yesterdayText, setYesterdayText] = useState('');
  const [todayText, setTodayText] = useState('');
  const [blockersText, setBlockersText] = useState('');
  const [standupHistory, setStandupHistory] = useState<StandupEntry[]>([]);

  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Role translations mapping
  const roleTranslations: Record<string, string> = {
    Coach: 'Coach (Entrenador)',
    Programmer: 'Programador',
    Tracker: 'Tracker (Rastreador)',
    Tester: 'Tester (Probador)',
    Client: 'Cliente',
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('xp_standup_history');
    if (cached) {
      try {
        setStandupHistory(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer Tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeakerSelect = (idx: number) => {
    setActiveSpeakerIdx(idx);
    // Find if there is already an entry for this person today in history, or clear inputs
    setYesterdayText('');
    setTodayText('');
    setBlockersText('');
  };

  const handleSubmitSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSpeakerIdx === null) return;

    const speaker = team[activeSpeakerIdx];
    const todayStr = new Date().toISOString().split('T')[0];

    const newEntry: StandupEntry = {
      date: todayStr,
      speaker: speaker.name,
      yesterday: yesterdayText || 'Tareas rutinarias completadas',
      today: todayText || 'Trabajando en historias de usuario asignadas',
      blockers: blockersText || 'Ninguno',
    };

    // Save and filter out any existing entry for this speaker today to prevent duplicates
    const updatedHistory = [
      newEntry,
      ...standupHistory.filter((h) => !(h.date === todayStr && h.speaker === speaker.name)),
    ];

    setStandupHistory(updatedHistory);
    localStorage.setItem('xp_standup_history', JSON.stringify(updatedHistory));

    // Clear inputs
    setYesterdayText('');
    setTodayText('');
    setBlockersText('');

    // Advance to next speaker or finish standup
    if (activeSpeakerIdx < team.length - 1) {
      setActiveSpeakerIdx(activeSpeakerIdx + 1);
    } else {
      setActiveSpeakerIdx(null);
      setIsTimerRunning(false);
    }
  };

  const resetStandup = () => {
    setActiveSpeakerIdx(null);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
  };

  const todayEntries = standupHistory.filter((h) => h.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Timer & Controls Header */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${isTimerRunning ? 'bg-indigo-400 animate-ping' : 'bg-zinc-600'}`}
          ></div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Límite de Tiempo de la Standup (Máx. 10 min)
            </div>
            <div
              id="standup-timer"
              className="text-2xl font-bold font-mono text-zinc-100"
              aria-live="off"
              aria-atomic="true"
            >
              {formatTime(secondsElapsed)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-all cursor-pointer"
          >
            {isTimerRunning ? '⏸ Pausar Cronómetro' : '▶ Reanudar Cronómetro'}
          </button>
          <button
            onClick={resetStandup}
            className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
          >
            🔄 Reiniciar Standup
          </button>
        </div>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {team.map((member, idx) => {
          const hasSpoken = todayEntries.some((h) => h.speaker === member.name);
          const isActive = activeSpeakerIdx === idx;

          return (
            <button
              key={`member-${member.name}`}
              type="button"
              onClick={() => handleSpeakerSelect(idx)}
              aria-pressed={isActive}
              className={`p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-105'
                  : hasSpoken
                    ? 'border-emerald-500/30 bg-emerald-500/5 opacity-80'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : hasSpoken
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="text-xs font-medium text-zinc-200 block truncate w-full">{member.name}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                {roleTranslations[member.role] || member.role}
              </span>
              {hasSpoken && <span className="text-[9px] font-mono text-emerald-400 font-semibold mt-1">✓ HABLÓ</span>}
            </button>
          );
        })}
      </div>

      {/* Speaking Wizard Details */}
      {activeSpeakerIdx !== null ? (
        <form
          onSubmit={handleSubmitSpeaker}
          className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm space-y-4 animate-[slide-up_0.3s_ease-out]"
        >
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 font-semibold">Orador Activo</span>
              <h3 className="text-base font-bold text-zinc-200 mt-0.5">{team[activeSpeakerIdx].name}</h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              Orador {activeSpeakerIdx + 1} de {team.length}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="standup-yesterday" className="text-xs font-mono text-zinc-400 block mb-1">
                1. ¿Qué hice ayer?
              </label>
              <textarea
                id="standup-yesterday"
                value={yesterdayText}
                onChange={(e) => setYesterdayText(e.target.value)}
                placeholder="Completé la implementación de los modelos de tarjetas de historia, programé en pareja con David..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
              />
            </div>

            <div>
              <label htmlFor="standup-today" className="text-xs font-mono text-zinc-400 block mb-1">
                2. ¿Qué haré hoy?
              </label>
              <textarea
                id="standup-today"
                value={todayText}
                onChange={(e) => setTodayText(e.target.value)}
                placeholder="Creando los rastreadores de refactorización, alineando los paneles de pruebas unitarias..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
              />
            </div>

            <div>
              <label htmlFor="standup-blockers" className="text-xs font-mono text-zinc-400 block mb-1">
                3. ¿Tengo algún impedimento?
              </label>
              <input
                id="standup-blockers"
                type="text"
                value={blockersText}
                onChange={(e) => setBlockersText(e.target.value)}
                placeholder="Sin impedimentos actuales / Necesito retroalimentación sobre la metáfora de diseño..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-semibold text-white shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              {activeSpeakerIdx < team.length - 1 ? 'Guardar y Siguiente' : 'Finalizar Standup'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center">
          <p className="text-sm text-zinc-500 italic">
            Selecciona un miembro del equipo arriba para iniciar su actualización diaria
          </p>
        </div>
      )}

      {/* History Logs */}
      <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md">
        <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Historial de Registros de Standup Diaria</h3>
          <button
            onClick={() => {
              if (confirm('¿Limpiar el historial de registros de la standup?')) {
                setStandupHistory([]);
                localStorage.removeItem('xp_standup_history');
              }
            }}
            className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 transition-colors"
          >
            Limpiar Historial
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto divide-y divide-zinc-800/40">
          {standupHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-600 italic">
              Aún no hay registros guardados. Completa una standup arriba.
            </div>
          ) : (
            standupHistory.map((entry) => (
              <div
                key={`${entry.date}-${entry.speaker}`}
                className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-start gap-4"
              >
                <div className="w-32 flex-shrink-0">
                  <div className="text-xs font-bold text-zinc-300">{entry.speaker}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{entry.date}</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Ayer: </span>
                    <span className="text-xs text-zinc-400">{entry.yesterday}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Hoy: </span>
                    <span className="text-xs text-zinc-400">{entry.today}</span>
                  </div>
                  {entry.blockers !== 'Ninguno' && entry.blockers !== 'None' && entry.blockers !== '' && (
                    <div className="inline-block px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-mono mt-1">
                      ⚠️ Impedimento: {entry.blockers}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
