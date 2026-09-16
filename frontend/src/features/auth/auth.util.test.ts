import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES } from '../../api/api.const';
import { AUTH_MESSAGES } from './auth.const';
import { loginErrors, registerErrors, validateNewPassword, validateNewUsername } from './auth.util';

describe('validateNewUsername', () => {
  it('accepts letters, digits and underscore', () => {
    expect(validateNewUsername('ash_ketchum_1')).toBeNull();
  });

  it('explains why characters are rejected', () => {
    expect(validateNewUsername('ash ketchum')).toBe(AUTH_MESSAGES.usernameCharacters);
    expect(validateNewUsername('ash-ketchum')).toBe(AUTH_MESSAGES.usernameCharacters);
    expect(validateNewUsername('jürgen')).toBe(AUTH_MESSAGES.usernameCharacters);
  });

  it('checks the length', () => {
    expect(validateNewUsername('')).toBe(AUTH_MESSAGES.usernameRequired);
    expect(validateNewUsername('ab')).toBe(AUTH_MESSAGES.usernameLength);
    expect(validateNewUsername('a'.repeat(33))).toBe(AUTH_MESSAGES.usernameLength);
  });
});

describe('validateNewPassword', () => {
  it('checks the length', () => {
    expect(validateNewPassword('short')).toBe(AUTH_MESSAGES.passwordTooShort);
    expect(validateNewPassword('a'.repeat(73))).toBe(AUTH_MESSAGES.passwordTooLong);
    expect(validateNewPassword('a'.repeat(72))).toBeNull();
  });

  it('rejects passwords above 72 bytes (BCrypt limit)', () => {
    expect(validateNewPassword('ä'.repeat(40))).toBe(AUTH_MESSAGES.passwordTooManyBytes);
  });
});

describe('error mapping', () => {
  it('maps a taken username to the username field', () => {
    expect(registerErrors({ status: 409, data: { detail: 'Username is already taken' } })).toEqual({
      fields: { username: AUTH_MESSAGES.usernameTaken },
    });
  });

  it('shows a generic message for wrong credentials', () => {
    expect(loginErrors({ status: 401, data: undefined }).form).toBe(AUTH_MESSAGES.invalidCredentials);
  });

  it('explains network problems', () => {
    expect(loginErrors({ status: 'FETCH_ERROR', error: 'Failed to fetch' }).form).toBe(
      ERROR_MESSAGES.serverUnreachable,
    );
  });
});
