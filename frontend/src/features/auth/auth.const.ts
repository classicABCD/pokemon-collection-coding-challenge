import type { AuthMode, Credentials } from './auth.type';

export const AUTH_MODE_OPTIONS: { value: AuthMode; label: string }[] = [
  { value: 'login', label: 'Login' },
  { value: 'register', label: 'Register' },
];

export const EMPTY_CREDENTIALS: Credentials = { username: '', password: '' };

/** Mirrors RegisterRequest in api/openapi.yaml; the backend validates the same rules. */
export const USERNAME_RULES = { minLength: 3, maxLength: 32, pattern: /^[a-zA-Z0-9_]+$/ } as const;
export const PASSWORD_RULES = { minLength: 8, maxLength: 72, maxBytes: 72 } as const;

export const USERNAME_HINT = `${USERNAME_RULES.minLength}–${USERNAME_RULES.maxLength} characters: letters (a–z), digits, underscore`;
export const PASSWORD_HINT = `${PASSWORD_RULES.minLength}–${PASSWORD_RULES.maxLength} characters`;

export const AUTH_MESSAGES = {
  usernameRequired: 'Please enter your username',
  passwordRequired: 'Please enter your password',
  usernameLength: `Username must be ${USERNAME_RULES.minLength}–${USERNAME_RULES.maxLength} characters long`,
  usernameCharacters: 'Only letters (a–z), digits and underscore are allowed — no spaces, dashes or umlauts',
  passwordTooShort: `Password must be at least ${PASSWORD_RULES.minLength} characters long`,
  passwordTooLong: `Password must not be longer than ${PASSWORD_RULES.maxLength} characters`,
  passwordTooManyBytes: 'Password is too long: special characters count double',
  usernameTaken: 'This username is already taken',
  invalidCredentials: 'Invalid username or password',
  invalidRegistration: 'Please check your input',
} as const;
