import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES } from './api.const';
import { errorMessage, errorStatus } from './apiError.util';

describe('errorMessage', () => {
  it('uses the problem detail of client errors', () => {
    expect(errorMessage({ status: 409, data: { detail: 'Pokémon 25 is already in your collection' } })).toBe(
      'Pokémon 25 is already in your collection',
    );
  });

  it('hides server details for 5xx and non-JSON responses', () => {
    expect(errorMessage({ status: 500, data: { detail: 'NullPointerException' } })).toBe(ERROR_MESSAGES.serverError);
    expect(errorMessage({ status: 'PARSING_ERROR', originalStatus: 500, data: '<html>', error: 'x' })).toBe(
      ERROR_MESSAGES.serverError,
    );
  });

  it('explains network and CSRF problems', () => {
    expect(errorMessage({ status: 'FETCH_ERROR', error: 'Failed to fetch' })).toBe(ERROR_MESSAGES.serverUnreachable);
    expect(errorMessage({ status: 502, data: undefined })).toBe(ERROR_MESSAGES.serverUnreachable);
    expect(errorMessage({ status: 'PARSING_ERROR', originalStatus: 504, data: '<html>', error: 'x' })).toBe(
      ERROR_MESSAGES.serverUnreachable,
    );
    expect(errorMessage({ status: 403, data: { detail: 'Access denied' } })).toBe(ERROR_MESSAGES.forbidden);
  });

  it('falls back for unknown errors', () => {
    expect(errorMessage(new Error('boom'))).toBe(ERROR_MESSAGES.unexpected);
    expect(errorMessage({ status: 400, data: undefined })).toBe(ERROR_MESSAGES.unexpected);
  });
});

describe('errorStatus', () => {
  it('returns numeric HTTP statuses only', () => {
    expect(errorStatus({ status: 401, data: undefined })).toBe(401);
    expect(errorStatus({ status: 'FETCH_ERROR', error: 'x' })).toBeUndefined();
  });
});
