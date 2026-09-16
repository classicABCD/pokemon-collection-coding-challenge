/** One polling interval for all queries, so every view stays equally fresh (e.g. after a catalog sync). */
export const POLLING_INTERVAL_MS = 5000;

/** Options passed to every query hook. Polling pauses while the browser tab is in the background. */
export const QUERY_OPTIONS = {
  pollingInterval: POLLING_INTERVAL_MS,
  skipPollingIfUnfocused: true,
} as const;

/** Cache tags, derived from the OpenAPI tags. */
export const TAG_TYPES = ['auth', 'catalog', 'collection'] as const;

/** Endpoints for which a 401 is an expected answer and must not trigger a session re-check. */
export const SESSION_ENDPOINTS: readonly string[] = ['getCurrentTrainer', 'login', 'register', 'logout'];

export const XSRF_COOKIE = 'XSRF-TOKEN';
export const XSRF_HEADER = 'X-XSRF-TOKEN';

/** Answered by the reverse proxy (nginx / Vite) when the backend is down. */
export const GATEWAY_STATUSES: readonly number[] = [502, 503, 504];

export const ERROR_MESSAGES = {
  serverUnreachable: 'The server is not reachable. Please check your connection and try again.',
  serverError: 'Something went wrong on the server. Please try again later.',
  forbidden: 'Your security token is missing or outdated. Please reload the page.',
  unexpected: 'Something went wrong. Please try again.',
} as const;
