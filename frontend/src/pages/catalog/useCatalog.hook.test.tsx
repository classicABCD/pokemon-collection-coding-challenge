import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_SYNC_POLLING_MS } from '../../api/api.const';
import { baseApi } from '../../api/baseApi';
import type { CatalogSyncState, Pokemon } from '../../api/pokemonApi';
import { useCatalog } from './useCatalog.hook';

const pikachu: Pokemon = { id: 25, name: 'pikachu', types: ['electric'], deprecated: false };

const CATALOG_PATH = '/api/pokemon';
const SYNC_STATUS_PATH = '/api/pokemon/sync-status';

/** Answers each endpoint with its responses in order; the last one repeats. */
const mockApi = (catalog: Pokemon[][], syncStates: CatalogSyncState[] = ['running']) => {
  const calls = { [CATALOG_PATH]: 0, [SYNC_STATUS_PATH]: 0 };
  const next = <T,>(responses: T[], path: keyof typeof calls) =>
    responses[Math.min(calls[path]++, responses.length - 1)];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const path = new URL(request.url).pathname;
      const body =
        path === SYNC_STATUS_PATH ? { state: next(syncStates, SYNC_STATUS_PATH) } : next(catalog, CATALOG_PATH);
      return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
    }),
  );
  return calls;
};

/** Node's Request cannot parse the relative API paths the browser resolves against the page origin. */
const resolveRelativeRequests = () => {
  class BrowserLikeRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(typeof input === 'string' ? new URL(input, window.location.origin) : input, init);
    }
  }
  vi.stubGlobal('Request', BrowserLikeRequest);
};

const renderCatalog = () => {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return renderHook(() => useCatalog(), { wrapper });
};

describe('useCatalog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resolveRelativeRequests();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not poll a loaded catalog, so an idle session can expire', async () => {
    const calls = mockApi([[pikachu]]);
    const { result } = renderCatalog();
    await waitFor(() => expect(result.current.data).toEqual([pikachu]));

    await act(() => vi.advanceTimersByTimeAsync(3 * CATALOG_SYNC_POLLING_MS));

    expect(calls[CATALOG_PATH]).toBe(1);
    expect(calls[SYNC_STATUS_PATH]).toBe(0);
  });

  it('polls while the initial sync is running and stops once the catalog is filled', async () => {
    const calls = mockApi([[], [pikachu]]);
    const { result } = renderCatalog();
    await waitFor(() => expect(result.current.data).toEqual([]));

    await act(() => vi.advanceTimersByTimeAsync(CATALOG_SYNC_POLLING_MS));
    await waitFor(() => expect(result.current.data).toEqual([pikachu]));

    await act(() => vi.advanceTimersByTimeAsync(3 * CATALOG_SYNC_POLLING_MS));
    expect(calls[CATALOG_PATH]).toBe(2);
    expect(result.current.syncFailed).toBe(false);
  });

  it('reports a failed sync while the catalog is empty and recovers once the backend retry loaded it', async () => {
    mockApi([[], [], [pikachu]], ['failed', 'failed', 'idle']);
    const { result } = renderCatalog();

    await waitFor(() => expect(result.current.syncFailed).toBe(true));

    await act(() => vi.advanceTimersByTimeAsync(2 * CATALOG_SYNC_POLLING_MS));
    await waitFor(() => expect(result.current.data).toEqual([pikachu]));
    expect(result.current.syncFailed).toBe(false);
  });
});
