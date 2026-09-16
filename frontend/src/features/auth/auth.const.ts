import type { AuthMode } from './auth.type';

export const AUTH_MODE_OPTIONS: { value: AuthMode; label: string }[] = [
  { value: 'login', label: 'Login' },
  { value: 'register', label: 'Register' },
];

export const USERNAME_HINT = '3–32 characters: letters, digits, underscore';
export const PASSWORD_HINT = 'At least 8 characters';
