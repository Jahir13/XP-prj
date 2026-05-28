import { atom } from 'nanostores';
import type { XPUser, User } from '../types';
import { usersApi } from '../api/usersApi';
import { DEV_CREDENTIALS } from '../lib/dev-credentials';

const AUTH_STORAGE_KEY = 'xp-flow-user-session';

function loadUserFromStorage(): XPUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export const $currentUser = atom<XPUser | null>(loadUserFromStorage());

export const CANONICAL_USERS: XPUser[] = [
  {
    id: 'coach',
    name: 'Christian Puchaicela',
    email: 'christian@xpflow.dev',
    xpRole: 'Coach',
    role: 'Coach',
    canBePaired: true,
    canBeAssigned: false,
    avatarInitials: 'CP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gestor',
    name: 'Jahir Rocha',
    email: 'jahir@xpflow.dev',
    xpRole: 'Gestor',
    role: 'Gestor',
    canBePaired: true,
    canBeAssigned: false,
    avatarInitials: 'JR',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cliente',
    name: 'Ariel Rosas',
    email: 'ariel@xpflow.dev',
    xpRole: 'Cliente',
    role: 'Cliente',
    canBePaired: false,
    canBeAssigned: false,
    avatarInitials: 'AR',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kevin',
    name: 'Kevin Palacios',
    email: 'kevin@xpflow.dev',
    xpRole: 'Programmer/Tester',
    role: 'Programmer/Tester',
    canBePaired: true,
    canBeAssigned: true,
    avatarInitials: 'KP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jhonathan',
    name: 'Jhonathan Pulig',
    email: 'jhonathan@xpflow.dev',
    xpRole: 'Programmer/Tester',
    role: 'Programmer/Tester',
    canBePaired: true,
    canBeAssigned: true,
    avatarInitials: 'JP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tracker',
    name: 'Santiago Pinta',
    email: 'santiago@xpflow.dev',
    xpRole: 'Tracker',
    role: 'Tracker',
    canBePaired: false,
    canBeAssigned: false,
    avatarInitials: 'SP',
    createdAt: new Date().toISOString(),
  },
];

export const adminUser: XPUser = CANONICAL_USERS[0]; // Fallback defaults to Coach Christian

const envMapping: Record<string, { emailKey: string; passwordKey: string }> = {
  coach: { emailKey: 'COACH_EMAIL', passwordKey: 'COACH_PASSWORD' },
  gestor: { emailKey: 'GESTOR_EMAIL', passwordKey: 'GESTOR_PASSWORD' },
  cliente: { emailKey: 'CLIENTE_EMAIL', passwordKey: 'CLIENTE_PASSWORD' },
  kevin: { emailKey: 'PROGRAMADOR_1_EMAIL', passwordKey: 'PROGRAMADOR_1_PASSWORD' },
  jhonathan: { emailKey: 'PROGRAMADOR_2_EMAIL', passwordKey: 'PROGRAMADOR_2_PASSWORD' },
  tracker: { emailKey: 'TRACKER_EMAIL', passwordKey: 'TRACKER_PASSWORD' },
};

export function getCredentials(id: string) {
  const mapping = envMapping[id];
  if (!mapping) return null;
  const email = import.meta.env[mapping.emailKey] || (DEV_CREDENTIALS as any)[id]?.email;
  const password = import.meta.env[mapping.passwordKey] || (DEV_CREDENTIALS as any)[id]?.password;
  return { email, password };
}

export function setCurrentUser(user: XPUser | null) {
  $currentUser.set(user);
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}

export function loginUser(email: string, password: string): XPUser | null {
  const user = CANONICAL_USERS.find((u) => u.email === email);
  if (!user) return null;
  const creds = getCredentials(user.id);
  if (creds && creds.password === password) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export async function fetchCurrentUser() {
  const local = loadUserFromStorage();
  if (local) {
    $currentUser.set(local);
    return local;
  }
  try {
    const user = await usersApi.profile();
    const xpUser: XPUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      xpRole: user.role as any,
      role: user.role,
      canBePaired: ['Coach', 'Gestor', 'Programmer/Tester', 'Programador/Tester'].includes(user.role),
      canBeAssigned: ['Programmer/Tester', 'Programador/Tester'].includes(user.role),
      avatarInitials: user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      createdAt: user.createdAt,
    };
    setCurrentUser(xpUser);
    return xpUser;
  } catch (err) {
    console.warn('Backend profile endpoint failed, using local development fallback:', err);
    const defaultUser = CANONICAL_USERS[0];
    setCurrentUser(defaultUser);
    return defaultUser;
  }
}
