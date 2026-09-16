import type { LoginRequest } from '../../api/pokemonApi';

export type AuthMode = 'login' | 'register';

/** Same shape for login and registration. */
export type Credentials = LoginRequest;

export interface AuthFormErrors {
  /** Shown below the affected input. */
  fields: Partial<Record<keyof Credentials, string>>;
  /** Shown above the submit button. */
  form?: string;
}
