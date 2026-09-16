import { errorMessage, errorStatus } from '../../api/apiError.util';
import { AUTH_MESSAGES, PASSWORD_RULES, USERNAME_RULES } from './auth.const';
import type { AuthFormErrors } from './auth.type';

/** Mantine form validators return an error message or null. */
type Validator = (value: string) => string | null;

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

export const validateLoginUsername: Validator = (value) => (value.trim() ? null : AUTH_MESSAGES.usernameRequired);

export const validateLoginPassword: Validator = (value) => (value ? null : AUTH_MESSAGES.passwordRequired);

export const validateNewUsername: Validator = (value) => {
  if (!value) {
    return AUTH_MESSAGES.usernameRequired;
  }
  if (value.length < USERNAME_RULES.minLength || value.length > USERNAME_RULES.maxLength) {
    return AUTH_MESSAGES.usernameLength;
  }
  return USERNAME_RULES.pattern.test(value) ? null : AUTH_MESSAGES.usernameCharacters;
};

export const validateNewPassword: Validator = (value) => {
  if (value.length < PASSWORD_RULES.minLength) {
    return AUTH_MESSAGES.passwordTooShort;
  }
  if (value.length > PASSWORD_RULES.maxLength) {
    return AUTH_MESSAGES.passwordTooLong;
  }
  return byteLength(value) > PASSWORD_RULES.maxBytes ? AUTH_MESSAGES.passwordTooManyBytes : null;
};

export const loginErrors = (error: unknown): AuthFormErrors =>
  errorStatus(error) === 401
    ? { fields: {}, form: AUTH_MESSAGES.invalidCredentials }
    : { fields: {}, form: errorMessage(error) };

export const registerErrors = (error: unknown): AuthFormErrors => {
  switch (errorStatus(error)) {
    case 409:
      return { fields: { username: AUTH_MESSAGES.usernameTaken } };
    case 400:
      // Client-side validation mirrors the backend rules, so this only happens if they drift apart
      return { fields: {}, form: AUTH_MESSAGES.invalidRegistration };
    default:
      return { fields: {}, form: errorMessage(error) };
  }
};
