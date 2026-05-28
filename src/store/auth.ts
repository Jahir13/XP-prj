import { atom } from 'nanostores';
import type { User } from '../types';
import { usersApi } from '../api/usersApi';

export const $currentUser = atom<User | null>(null);

export async function fetchCurrentUser() {
  try {
    const user = await usersApi.profile();
    $currentUser.set(user);
    return user;
  } catch (err) {
    console.warn('Backend profile endpoint failed, using local development fallback:', err);
    const fallbackUser: User = {
      id: 'dev-kevin',
      email: 'kevin.palacios@example.com',
      name: 'Kevin Palacios',
      role: 'Programmer/Tester',
      avatar: '💻',
      createdAt: new Date().toISOString(),
    };
    $currentUser.set(fallbackUser);
    return fallbackUser;
  }
}
