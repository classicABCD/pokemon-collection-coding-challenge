import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ERROR_MESSAGES, GATEWAY_STATUSES } from './api.const';
import type { ProblemDetail } from './generated';

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error;

/** HTTP status of an RTK Query error, or undefined for network and client-side errors. */
export const errorStatus = (error: unknown): number | undefined =>
  isFetchBaseQueryError(error) && typeof error.status === 'number' ? error.status : undefined;

/** RFC 9457 `detail` sent by the backend, if any. */
export const problemDetail = (error: unknown): string | undefined =>
  isFetchBaseQueryError(error) ? (error.data as ProblemDetail | undefined)?.detail : undefined;

/**
 * User-facing message for any failed request. Server-side details are only shown for client errors (4xx),
 * never for 5xx responses.
 */
export const errorMessage = (error: unknown): string => {
  if (!isFetchBaseQueryError(error)) {
    return ERROR_MESSAGES.unexpected;
  }
  const status = errorStatus(error) ?? (error.status === 'PARSING_ERROR' ? error.originalStatus : undefined);
  if (
    error.status === 'FETCH_ERROR' ||
    error.status === 'TIMEOUT_ERROR' ||
    (status !== undefined && GATEWAY_STATUSES.includes(status))
  ) {
    return ERROR_MESSAGES.serverUnreachable;
  }
  if (status === undefined || status >= 500) {
    return ERROR_MESSAGES.serverError;
  }
  if (status === 403) {
    return ERROR_MESSAGES.forbidden;
  }
  return problemDetail(error) ?? ERROR_MESSAGES.unexpected;
};
