// TODO: unused store — pending removal
// This store defined the AuthState interface but is currently not imported or used anywhere.

import type { User } from '../types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
