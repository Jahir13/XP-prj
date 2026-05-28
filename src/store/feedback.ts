import { atom } from 'nanostores';

export interface FeedbackNote {
  id: string;
  category: 'bien' | 'cambios' | 'acciones';
  content: string;
  author: string;
  practice: string;
  votes: number;
  votedBy: string[];
  createdAt: string;
}

const STORAGE_KEY = 'xp-flow-feedback-notes';

const SEED_NOTES: FeedbackNote[] = [
  // Salió Bien
  {
    id: 'seed-bien-1',
    category: 'bien',
    content: 'La programación en pareja para HU-01 y HU-02 fluyó excelente. Captura rápida de lógicas de negocio.',
    author: 'Kevin Palacios',
    practice: 'Programación en Pareja',
    votes: 3,
    votedBy: ['Jhonathan Pulig', 'Christian Puchaicela', 'Jahir Rocha'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-bien-2',
    category: 'bien',
    content: 'El enfoque TDD en HU-04 permitió detectar a tiempo un bug crítico en el parseador de la API de LLM.',
    author: 'Jhonathan Pulig',
    practice: 'Desarrollo Guiado por Pruebas (TDD)',
    votes: 4,
    votedBy: ['Kevin Palacios', 'Christian Puchaicela', 'Jahir Rocha', 'Ariel Rosas'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-bien-3',
    category: 'bien',
    content: 'Liberaciones rápidas (Small Releases) nos dieron feedback temprano del cliente sobre la visualización.',
    author: 'Ariel Rosas',
    practice: 'Entregas Pequeñas',
    votes: 2,
    votedBy: ['Kevin Palacios', 'Jahir Rocha'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Requiere Cambios
  {
    id: 'seed-cambios-1',
    category: 'cambios',
    content: 'El timeout de la API de LLM causa latencia en el backend. Necesitamos reintentos con backoff.',
    author: 'Kevin Palacios',
    practice: 'Diseño Simple',
    votes: 5,
    votedBy: ['Jhonathan Pulig', 'Christian Puchaicela', 'Jahir Rocha', 'Ariel Rosas', 'Kevin Palacios'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-cambios-2',
    category: 'cambios',
    content: 'Los límites del localStorage local impiden sincronizar historial entre múltiples navegadores.',
    author: 'Jahir Rocha',
    practice: 'Diseño Simple',
    votes: 3,
    votedBy: ['Kevin Palacios', 'Jhonathan Pulig', 'Christian Puchaicela'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-cambios-3',
    category: 'cambios',
    content: 'Investigar diarización de locutores para separar quién habla en la reunión.',
    author: 'Jhonathan Pulig',
    practice: 'Metáfora del Sistema',
    votes: 2,
    votedBy: ['Kevin Palacios', 'Jahir Rocha'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Acciones a Tomar
  {
    id: 'seed-acciones-1',
    category: 'acciones',
    content: 'Definir proveedor de LLM estable (Ariel y Jahir validarán costos e infraestructura).',
    author: 'Christian Puchaicela',
    practice: 'Entregas Pequeñas',
    votes: 3,
    votedBy: ['Jahir Rocha', 'Ariel Rosas', 'Kevin Palacios'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-acciones-2',
    category: 'acciones',
    content: 'Migrar almacenamiento temporal a IndexedDB para evadir cuotas de localStorage (DT-02).',
    author: 'Kevin Palacios',
    practice: 'Refactorización',
    votes: 4,
    votedBy: ['Jhonathan Pulig', 'Christian Puchaicela', 'Jahir Rocha', 'Kevin Palacios'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-acciones-3',
    category: 'acciones',
    content: 'Realizar Spike de 2 días sobre diarización web con librería de código abierto.',
    author: 'Jhonathan Pulig',
    practice: 'Diseño Simple',
    votes: 2,
    votedBy: ['Kevin Palacios', 'Jahir Rocha'],
    createdAt: new Date().toISOString(),
  },
];

function loadFeedbackNotes(): FeedbackNote[] {
  if (typeof window === 'undefined') return SEED_NOTES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return SEED_NOTES;
}

export const $feedbackNotes = atom<FeedbackNote[]>(loadFeedbackNotes());

if (typeof window !== 'undefined') {
  $feedbackNotes.subscribe((val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  });
}

export function addFeedbackNote(note: Omit<FeedbackNote, 'id' | 'votes' | 'votedBy' | 'createdAt'>) {
  const newNote: FeedbackNote = {
    ...note,
    id: `feedback-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    votes: 0,
    votedBy: [],
    createdAt: new Date().toISOString(),
  };
  $feedbackNotes.set([...$feedbackNotes.get(), newNote]);
}

export function removeFeedbackNote(id: string) {
  $feedbackNotes.set($feedbackNotes.get().filter((n) => n.id !== id));
}

export function voteFeedbackNote(id: string, userName: string) {
  $feedbackNotes.set(
    $feedbackNotes.get().map((n) => {
      if (n.id !== id) return n;
      const alreadyVoted = n.votedBy.includes(userName);
      const votedBy = alreadyVoted ? n.votedBy.filter((name) => name !== userName) : [...n.votedBy, userName];
      return {
        ...n,
        votes: votedBy.length,
        votedBy,
      };
    }),
  );
}

export function clearFeedbackNotes() {
  $feedbackNotes.set(SEED_NOTES);
}
