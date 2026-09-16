import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { SESSION_ENDPOINTS, TAG_TYPES, XSRF_COOKIE, XSRF_HEADER } from './api.const';
import { readCookie } from './cookie.util';

/**
 * Same origin (nginx / Vite proxy), so the session cookie is sent automatically.
 * State-changing requests carry the CSRF token from the XSRF-TOKEN cookie (ADR-2).
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  credentials: 'same-origin',
  prepareHeaders: (headers) => {
    const xsrfToken = readCookie(XSRF_COOKIE);
    if (xsrfToken) {
      headers.set(XSRF_HEADER, xsrfToken);
    }
    return headers;
  },
});

/** A 401 on a regular endpoint means the session expired: re-check it, so protected routes redirect to login. */
const baseQueryWithSessionCheck: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && !SESSION_ENDPOINTS.includes(api.endpoint)) {
    api.dispatch(baseApi.util.invalidateTags(['auth']));
  }
  return result;
};

/** Base API for the endpoints generated from the OpenAPI contract (ADR-5). */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithSessionCheck,
  tagTypes: TAG_TYPES,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
