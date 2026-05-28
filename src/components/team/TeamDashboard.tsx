import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $sessionHistory } from '../../store/pairSession';

interface TeamMember {
  name: string;
  role: 'Coach' | 'Gestor' | 'Cliente' | 'Programmer/Tester' | 'Tracker';
  description: string;
  avatar: string;
  weeklyHours: number; // Seed baseline hours
}

export default function TeamDashboard() {
  const history = useStore($sessionHistory);

  // Initial Seed Team
  const [team, setTeam] = useState<TeamMember[]>([
    {
      name: 'Christian Puchaicela',
      role: 'Coach',
      description:
        'Mantiene la disciplina en los estándares de programación extrema (XP). Resuelve impedimentos de coordinación y capacita en retroalimentación continua.',
      avatar: '🧙‍♀️',
      weeklyHours: 35,
    },
    {
      name: 'Jahir Rocha',
      role: 'Gestor',
      description:
        'Gestor del proyecto, también conocido como Big Boss o Jefe. Conecta a los interesados con el equipo y lidera la dirección del proyecto.',
      avatar: '👑',
      weeklyHours: 41,
    },
    {
      name: 'Ariel Rosas',
      role: 'Cliente',
      description:
        'Cliente del proyecto. Define los alcances de las tarjetas de historias de usuario, los valores de negocio y acepta las iteraciones funcionales.',
      avatar: '💼',
      weeklyHours: 30,
    },
    {
      name: 'Kevin Palacios',
      role: 'Programmer/Tester',
      description:
        'Estima la complejidad de las historias de usuario, escribe pruebas unitarias automatizadas (TDD), programa en pareja diariamente y refactoriza el código.',
      avatar: '💻',
      weeklyHours: 38,
    },
    {
      name: 'Jhonathan Pulig',
      role: 'Programmer/Tester',
      description:
        'Apoya al cliente en la redacción de criterios de aceptación de alta cobertura. Valida los entornos de prueba automatizados y los lanzamientos.',
      avatar: '🔍',
      weeklyHours: 39,
    },
    {
      name: 'Santiago Pinta',
      role: 'Tracker',
      description:
        'Realiza el seguimiento de las métricas del equipo, mide la velocidad del proyecto, el cumplimiento del ritmo sostenible y el avance del burndown chart.',
      avatar: '📊',
      weeklyHours: 37,
    },
  ]);

  // Form states for adding member
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Coach' | 'Gestor' | 'Cliente' | 'Programmer/Tester' | 'Tracker'>(
    'Programmer/Tester',
  );
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('💻');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Role translations mapping
  const roleTranslations: Record<string, string> = {
    Coach: 'Coach (Entrenador)',
    Gestor: 'Gestor (Project Manager)',
    Cliente: 'Cliente',
    'Programmer/Tester': 'Programador / Tester',
    Tracker: 'Tracker (Rastreador)',
  };

  // Compute actual weekly hours from pair logs
  const teamWithPairLogs = useMemo(() => {
    return team.map((member) => {
      // Pacing hours restricted: Ariel and Santiago are not pairable, their hours are rendered as 0
      if (member.name === 'Ariel Rosas' || member.name === 'Santiago Pinta') {
        return {
          ...member,
          actualHours: 0,
        };
      }

      // Find all pair sessions for this member
      const pairLogs = history.filter((h) => h.driver === member.name || h.navigator === member.name);
      const pairHours = pairLogs.reduce((sum, h) => sum + h.durationMinutes, 0) / 60;

      // Sum baseline hours + actual pair logs
      const actualHours = Math.round((member.weeklyHours + pairHours) * 10) / 10;

      return {
        ...member,
        actualHours,
      };
    });
  }, [team, history]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      name,
      role,
      description:
        description ||
        'Miembro del equipo de Programación Extrema, que contribuye a las entregas pequeñas y a los estándares limpios.',
      avatar,
      weeklyHours: 35,
    };

    setTeam((prev) => [...prev, newMember]);
    setName('');
    setDescription('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Equipo y Ritmo Sostenible</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">Práctica XP: Ritmo Sostenible y Asignación de Roles</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
        >
          {isFormOpen ? 'Cerrar Formulario' : 'Agregar Miembro'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sustainable Pace Monitor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <h3 className="text-sm font-semibold text-zinc-200">Monitor de Ritmo Sostenible</h3>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono leading-normal">
              Las pautas de XP establecen una **semana laboral de 40 horas**. Las horas extra representan altos riesgos
              de agotamiento (burnout) y conducen a errores en el código.
            </p>

            <div className="space-y-4">
              {teamWithPairLogs.map((member) => {
                const isOvertime = member.actualHours >= 40;
                return (
                  <div key={member.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">
                        {member.avatar} {member.name.split(' ')[0]}
                      </span>
                      <span className={`font-mono font-bold ${isOvertime ? 'text-rose-400' : 'text-indigo-400'}`}>
                        {member.actualHours} hrs / 40
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOvertime
                            ? 'bg-rose-500 animate-[pulse-glow_2s_infinite]'
                            : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                        }`}
                        style={{ width: `${Math.min(100, (member.actualHours / 40) * 100)}%` }}
                      />
                    </div>

                    {isOvertime && (
                      <span className="text-[9px] font-mono text-rose-400 font-bold block animate-pulse">
                        ⚠ RIESGO DE AGOTAMIENTO: ¡Se detectaron horas extra!
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Columns: Roster directory & Add Member Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Member Form */}
          {isFormOpen && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <h3 className="text-sm font-semibold text-zinc-200">Agregar Nuevo Miembro del Equipo</h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="team-name"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Nombre Completo
                    </label>
                    <input
                      id="team-name"
                      type="text"
                      placeholder="Ej. Frank Sinatra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="team-role"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Rol XP
                    </label>
                    <select
                      id="team-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="Programmer/Tester">Programador / Tester</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Coach">Coach (Entrenador Ágil)</option>
                      <option value="Tracker">Tracker (Auditor de Métricas)</option>
                      <option value="Gestor">Gestor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="team-avatar"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Avatar del Rol
                    </label>
                    <select
                      id="team-avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      <option value="💻">💻 Avatar de Programador/Tester</option>
                      <option value="🧙‍♀️">🧙‍♀️ Avatar de Coach</option>
                      <option value="👑">👑 Avatar de Gestor</option>
                      <option value="💼">💼 Avatar de Cliente</option>
                      <option value="📊">📊 Avatar de Tracker</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5">
                      Estado de Asignación
                    </span>
                    <div className="px-3 py-2 text-xs rounded-lg bg-zinc-800/40 border border-zinc-700/50 text-zinc-400 font-mono">
                      Línea base semanal activa: 35 hrs
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="team-desc"
                    className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                  >
                    Responsabilidades del Rol
                  </label>
                  <textarea
                    id="team-desc"
                    placeholder="Describe las actividades estándar and específicas de este miembro..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-16 p-2 text-xs rounded bg-zinc-850 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition-colors cursor-pointer"
                  >
                    Confirmar Asignación
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

          {/* Roster Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamWithPairLogs.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-zinc-700 transition-all hover:scale-[1.01]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{member.avatar}</span>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      {roleTranslations[member.role] || member.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">{member.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Pautas del Rol</p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{member.description}</p>
                </div>

                <div className="border-t border-zinc-800/50 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span>Ritmo Sostenible</span>
                  <span className="font-semibold text-zinc-300">{member.actualHours} hrs registradas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
