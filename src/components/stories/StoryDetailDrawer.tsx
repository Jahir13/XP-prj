import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import type { RuntimeStory } from '../../store/stories';
import { updateStory, removeStory } from '../../store/stories';
import { $sessionHistory } from '../../store/pairSession';

interface Props {
  story: RuntimeStory | null;
  onClose: () => void;
  onEdit?: (story: RuntimeStory) => void;
}

const statusColors = {
  Backlog: { bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
  Current: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  Done: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

const riskColors = {
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const defaultObservations: Record<string, string[]> = {
  'hu-01': [
    'Se debe solicitar permisos de micrófono explícitamente en el navegador.',
    'Los formatos de audio soportados dependerán del navegador, se usa mock API en browsers no compatibles.',
    'El estado de la grabación se almacena temporalmente en el cliente y se procesa al finalizar.',
  ],
  'hu-02': [
    'La precisión de la transcripción depende de la API Web Speech del navegador.',
    'Se requiere conexión a Internet activa para el servicio de speech-to-text en algunos sistemas operativos.',
    'El retardo de transcripción es inferior a 2 segundos en promedio en pruebas locales.',
  ],
  'hu-03': [
    'La separación de voces requiere hardware de micrófono multicanal o algoritmos avanzados de diarización.',
    'Es una característica de alta complejidad (puntos: 5) con prioridad baja en la planificación actual.',
    'Implementar diarización local simplificada mediante análisis de espectro en el cliente si es posible.',
  ],
  'hu-04': [
    'El tiempo de procesamiento de extracción IA oscila entre 3 y 8 segundos promedio.',
    'Se requiere validación humana explícita antes de persistir las tareas en el dashboard.',
    'Manejar timeouts de manera graceful en caso de desconexión de la API externa.',
  ],
  'hu-05': [
    'La persistencia local usa localStorage en el prototipo y migrará a IndexedDB/SQLite en producción.',
    'Los datos deben persistir e hidratarse correctamente a través de recargas del navegador.',
    'Se requiere resguardo de datos local en caso de fallas imprevistas de escritura.',
  ],
  'hu-06': [
    'Las tareas pendientes se listan automáticamente en orden cronológico ascendente.',
    'Las tareas completadas se tachan visualmente para marcar progreso claro.',
    'Filtrar estrictamente para excluir observaciones generales de la lista del panel.',
  ],
  'hu-07': [
    'Las observaciones documentan decisiones de diseño, dudas y contexto de la reunión.',
    'Se clasifican por separado de las tareas para no saturar el panel de pendientes principal.',
    'Se organizan cronológicamente y por reunión/sesión de origen asociada.',
  ],
};

const possibleUnitTests: Record<string, string[]> = {
  'hu-01': [
    'iniciarSesion() -> cambia estado de grabación a "activa" e inicializa el temporizador.',
    'finalizarSesion() -> detiene temporizador y cambia estado a "finalizada".',
    'solicitarPermiso() -> maneja correctamente la denegación de permisos de micrófono.',
  ],
  'hu-02': [
    'procesarFragmentoAudio(blob) -> convierte fragmento a texto simulado en entornos de prueba.',
    'agregarTextoTranscripcion(texto) -> añade texto nuevo al final de la transcripción acumulada.',
    'detenerCaptura() -> detiene stream de captura de audio sin lanzar excepciones.',
  ],
  'hu-03': [
    'asignarEtiquetaHablante(fragmento) -> asigna etiquetas "Voz 1", "Voz 2" de manera coherente.',
    'resetearHablantes() -> limpia las referencias de oradores y reinicia el acumulador.',
  ],
  'hu-04': [
    'construirPrompt(transcripcion) -> genera un string formateado para la API de LLM.',
    'parsearRespuestaLLM(json) -> parsea la respuesta JSON de LLM a objetos estructurados de tareas.',
    'editarItem(id, campo, valor) -> actualiza un campo del ítem sin mutar otros elementos.',
    'eliminarItem(id) -> remueve un ítem sugerido antes de confirmar el guardado.',
  ],
  'hu-05': [
    'guardarTarea({descripcion, fechalimite}) -> inserta en localStorage con estado="Pendiente".',
    'obtenerTareas() -> retorna todos los registros guardados garantizando persistencia entre sesiones.',
  ],
  'hu-06': [
    'ordenarTareasPorFecha(tareas) -> ordena ascendentemente colocando las tareas sin fecha al final.',
    'marcarCompletada(id) -> cambia el estado de la tarea en almacenamiento persistente.',
    'obtenerTareasPendientes() -> excluye las tareas marcadas como completadas.',
  ],
  'hu-07': [
    'clasificarItem(item) -> diferencia con éxito si un ítem representa una "tarea" o una "observación".',
    'guardarObservacion({texto, reunionId}) -> persiste una observación vinculada a una sesión.',
    'obtenerObservacionesPorReunion(id) -> filtra las observaciones para mostrar solo las asociadas a la reunión.',
  ],
};

const possibleFunctionalTests: Record<string, string[]> = {
  'hu-01': [
    'TC-01.1: Botón "Iniciar Reunión" es visible al cargar la app.',
    'TC-01.2: Al presionar Iniciar, el navegador solicita permisos de micrófono (mocked).',
    'TC-01.3: Sistema confirma visualmente que la sesión está activa y muestra temporizador.',
    'TC-01.4: Botón "Finalizar Reunión" es visible durante la sesión activa.',
    'TC-01.5: Al presionar Finalizar, la sesión se cierra y no se captura audio.',
    'TC-01.6: Botón Finalizar no es interactivo si no hay sesión activa.',
  ],
  'hu-02': [
    'TC-02.1: Transcripción aparece en pantalla en tiempo real al simular entrada de audio.',
    'TC-02.2: Transcripción muestra los fragmentos en orden cronológico ascendente.',
    'TC-02.3: Área de transcripción es desplazable (scroll) al acumular líneas de conversación.',
    'TC-02.4: Transcripción se detiene de inmediato al presionar Finalizar.',
    'TC-02.5: Sistema funciona correctamente en el navegador Chrome (Chromium).',
  ],
  'hu-03': [
    'TC-03.1: Sistema asigna etiquetas diferentes a hablantes ("Voz 1", "Voz 2") durante la charla.',
    'TC-03.2: Misma persona mantiene su etiqueta consistente en todas sus intervenciones.',
  ],
  'hu-04': [
    'TC-04.1: Sistema muestra indicador visual de procesamiento mientras espera respuesta de LLM.',
    'TC-04.2: Resumen extraído lista tareas con campos completos (Descripción, Responsable, Fecha).',
    'TC-04.3: Usuario puede editar campos de una tarea extraída en el formulario de confirmación.',
    'TC-04.4: Usuario puede agregar manualmente una nueva tarea a la lista extraída.',
    'TC-04.5: Usuario puede eliminar una tarea errónea del resumen sugerido.',
    'TC-04.6: Al presionar Confirmar, todos los ítems pasan al almacenamiento persistente.',
  ],
  'hu-05': ['TC-05.1: Tareas aparecen inmediatamente en el dashboard tras presionar Confirmar en el resumen.'],
  'hu-06': [
    'TC-06.1: Tareas se ordenan por fecha límite en forma ascendente en el panel.',
    'TC-06.2: Tareas sin fecha definida se posicionan al final de la lista del panel.',
    'TC-06.3: Cambios de estado (marcar como completada) persisten de forma íntegra tras recarga.',
  ],
  'hu-07': [
    'TC-07.1: Sistema distingue tareas de observaciones separándolas en módulos independientes.',
    'TC-07.2: Usuario puede acceder a las observaciones guardadas desde una sección dedicada.',
    'TC-07.3: Observaciones no aparecen en la lista de pendientes del dashboard de tareas.',
  ],
};

export default function StoryDetailDrawer({ story, onClose, onEdit }: Props) {
  const history = useStore($sessionHistory);
  const [roleError, setRoleError] = useState<string | null>(null);

  const isAuthorizedToEdit = useMemo(() => {
    return true;
  }, []);
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (story) {
      const storageKey = `xp-flow-acceptance-${story.id}`;
      const saved = localStorage.getItem(storageKey);
      setCheckedCriteria(saved ? JSON.parse(saved) : {});
    }
  }, [story]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!story) return null;

  const sc = statusColors[story.status] || statusColors.Backlog;
  const rc = riskColors[story.risk] || riskColors.Low;

  const keyId = story.id.toLowerCase();
  const obs = defaultObservations[keyId] || ['Sin observaciones particulares registradas.'];
  const units = possibleUnitTests[keyId] || ['Pruebas unitarias de cobertura general.'];
  const functionals = possibleFunctionalTests[keyId] || ['Prueba funcional del flujo principal.'];

  // Match pair programming sessions
  const associatedPairs = history.filter((log) => log.relatedStory?.toLowerCase() === story.id.toLowerCase());

  const toggleCriterion = (index: number) => {
    const isAllowed = true;

    if (!isAllowed) {
      setRoleError('Acceso Denegado: Solo los programadores/testers, el Gestor o el Coach pueden validar criterios.');
      setTimeout(() => setRoleError(null), 4000);
      return;
    }

    const nextChecked = { ...checkedCriteria, [index]: !checkedCriteria[index] };
    setCheckedCriteria(nextChecked);

    const storageKey = `xp-flow-acceptance-${story.id}`;
    localStorage.setItem(storageKey, JSON.stringify(nextChecked));

    // Update story to trigger re-renders in other views
    updateStory(story.id, {});
  };

  // Simple static changelog fallback
  const getChangelog = () => {
    const list = [{ date: '2026-05-10', desc: 'Historia redactada y validada por el Cliente Ariel Rosas.' }];
    if (story.status === 'Current' || story.status === 'Done') {
      list.push({ date: '2026-05-18', desc: 'Asignada a la iteración activa por el Gestor Jahir Rocha.' });
      list.push({
        date: '2026-05-20',
        desc: `Iniciada en parejas por ${story.assignedPair.join(' & ') || 'Kevin Palacios'}.`,
      });
    }
    if (story.status === 'Done') {
      list.push({ date: '2026-05-25', desc: 'Criterios de aceptación verificados y marcada como Terminada.' });
    }
    return list;
  };

  return (
    <>
      {/* Background Overlay */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-40 transition-opacity" onClick={onClose} />

      {/* Drawer slide-over */}
      <div
        role="dialog"
        aria-labelledby="drawer-title"
        className="fixed top-0 right-0 h-screen w-full sm:w-[640px] bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col focus:outline-none animate-[slide-in_0.3s_ease-out]"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 bg-zinc-950/80 backdrop-blur-md px-6 py-4.5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div>
            <nav className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1.5">
              <span>XP-Flow</span>
              <span>&gt;</span>
              <span>Historias</span>
              <span>&gt;</span>
              <span className="text-zinc-300 font-bold">{story.id.toUpperCase()}</span>
            </nav>
            <h2 id="drawer-title" className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-indigo-400 font-mono">[{story.id.toUpperCase()}]</span>
              <span>{story.title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && isAuthorizedToEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(story);
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-150 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-zinc-700/60"
                title="Editar Historia"
              >
                <span>✏️</span> Editar
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Estás seguro de eliminar la historia ${story.id.toUpperCase()}?`)) {
                  removeStory(story.id);
                  onClose();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800/50 text-rose-300 hover:text-rose-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-rose-700/40"
              title="Eliminar Historia"
            >
              <span>🗑️</span> Eliminar
            </button>
            <a
              href={`/stories/${story.id}`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Abrir en página completa"
              aria-label="Abrir en página completa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Cerrar panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {roleError && (
            <div className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg animate-pulse">
              ⚠️ {roleError}
            </div>
          )}

          {/* Metadata Grid */}
          <section className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4.5 space-y-3">
            <h3 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold mb-2">
              Metadatos de la Historia
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Asignada a Pareja:</span>
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  {story.assignedPair.length > 0 ? (
                    <>
                      <span>👥</span>
                      <span>{story.assignedPair.join(' & ')}</span>
                    </>
                  ) : (
                    <span className="text-zinc-600 italic font-normal">Sin asignar</span>
                  )}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Creado Por:</span>
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span>👤</span>
                  <span>Ariel Rosas (Cliente)</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Iteración Planificada:</span>
                <span className="text-xs font-mono text-zinc-300">
                  {story.iteration ? `Iteración ${story.iteration.split('-')[1]}` : 'Sin iteración'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Puntos Estimados (Fibonacci):</span>
                <span className="text-xs font-bold font-mono text-indigo-400">
                  {story.points} {story.points === 1 ? 'punto' : 'puntos'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Prioridad Negocio (VN):</span>
                <span className="flex items-center gap-0.5 text-xs">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className={idx < story.businessValue ? 'text-amber-400' : 'text-zinc-700'}>
                      ★
                    </span>
                  ))}
                  <span className="text-[10px] text-zinc-500 font-mono ml-1">({story.businessValue}/5)</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Riesgo en Desarrollo:</span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${rc}`}>
                  Riesgo {story.risk}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Estado Tablero:</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}
                >
                  {story.status}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500">Desarrollo TDD:</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    story.isTDD
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {story.isTDD ? 'TDD Habilitado' : 'No Habilitado'}
                </span>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Descripción de la Historia
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950/20 p-3 rounded-lg border border-zinc-800/40">
              Como **
              {story.id === 'hu-04'
                ? 'Profesional ocupado'
                : story.id === 'hu-07'
                  ? 'Usuario organizado'
                  : 'Usuario de la reunión'}
              **, quiero poder{' '}
              {story.id === 'hu-01'
                ? 'iniciar y finalizar la sesión de grabación'
                : story.id === 'hu-02'
                  ? 'ver la transcripción de la charla en tiempo real'
                  : story.id === 'hu-03'
                    ? 'diferenciar las voces de los participantes'
                    : story.id === 'hu-04'
                      ? 'extraer automáticamente tareas e ítems de compromiso'
                      : story.id === 'hu-05'
                        ? 'guardar las tareas localmente'
                        : story.id === 'hu-06'
                          ? 'visualizar mis tareas ordenadas en un panel'
                          : 'guardar observaciones generales'}{' '}
              para{' '}
              {story.id === 'hu-01'
                ? 'capturar el audio de nuestras discusiones de proyecto'
                : story.id === 'hu-02'
                  ? 'saber qué se está acordando'
                  : story.id === 'hu-03'
                    ? 'saber exactamente quién aportó cada idea'
                    : story.id === 'hu-04'
                      ? 'no perder de vista los acuerdos de la reunión'
                      : story.id === 'hu-05'
                        ? 'garantizar la persistencia entre sesiones'
                        : story.id === 'hu-06'
                          ? 'llevar un seguimiento visual ágil de mis pendientes'
                          : 'documentar información de contexto o decisiones complementarias de diseño'}
              .
            </p>
          </section>

          {/* Observations */}
          <section className="space-y-2">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Observaciones de la Historia
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 px-1 font-sans">
              {obs.map((ob, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="text-zinc-300">{ob}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Acceptance Criteria Checkbox list */}
          <section className="space-y-3">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Criterios de Aceptación (Verificación)
            </h3>
            <div className="space-y-2">
              {story.acceptanceCriteria.map((crit, idx) => {
                const isChecked = checkedCriteria[idx] || story.status === 'Done';
                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleCriterion(idx)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleCriterion(idx);
                      }
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-800/10 cursor-pointer select-none transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-zinc-700 text-transparent'
                      }`}
                    >
                      {isChecked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-emerald-400"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <span className={`text-xs ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {crit}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          isChecked
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                        }`}
                      >
                        {isChecked ? 'Pasando ✓' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Possible Unit Tests */}
          <section className="space-y-2">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Pruebas Unitarias del Módulo (TDD)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-400 px-1 font-mono">
              {units.map((unit, idx) => (
                <li key={idx} className="leading-relaxed">
                  <code className="text-indigo-300">{unit}</code>
                </li>
              ))}
            </ol>
          </section>

          {/* Possible Functional Tests */}
          <section className="space-y-2">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Pruebas Funcionales E2E (Playwright)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-400 px-1 font-sans">
              {functionals.map((func, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="text-zinc-300">{func}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Associated Pair Programming Sessions */}
          <section className="space-y-3">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1 font-semibold">
              Sesiones de Pareja Asociadas
            </h3>
            <div className="space-y-2">
              {associatedPairs.length > 0 ? (
                associatedPairs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👥</span>
                      <div>
                        <div className="font-semibold text-zinc-200">
                          {log.driver} <span className="font-normal text-zinc-500">y</span> {log.navigator}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {new Date(log.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/15">
                        {log.durationMinutes} min
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-600 italic py-2 text-center bg-zinc-950/20 border border-dashed border-zinc-800 rounded-lg">
                  No hay sesiones de pareja registradas.
                </div>
              )}
            </div>
          </section>

          {/* Changelog */}
          <section className="space-y-3">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold border-b border-zinc-800 pb-1">
              Historial de Cambios
            </h3>
            <div className="relative border-l border-zinc-800 pl-4.5 space-y-4 py-1">
              {getChangelog().map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[24px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900" />
                  <span className="block text-[10px] font-mono text-zinc-500">{item.date}</span>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
