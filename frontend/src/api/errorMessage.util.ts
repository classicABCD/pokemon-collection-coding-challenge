import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ProblemDetail } from './generated';

/** Human-readable message from an RTK Query error; uses the RFC 9457 `detail` sent by the backend. */
export const errorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | undefined => {
  if (!error) {
    return undefined;
  }
  if ('status' in error) {
    const problem = error.data as ProblemDetail | undefined;
    return problem?.detail ?? problem?.title ?? 'Request failed. Please try again.';
  }
  return error.message ?? 'Unexpected error';
};
