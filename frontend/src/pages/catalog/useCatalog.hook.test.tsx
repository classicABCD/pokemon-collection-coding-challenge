import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_SYNC_POLLING_MS } from '../../api/api.const';
import { baseApi } from '../../api/baseApi';
import type { Pokemon } from '../../api/pokemonApi';
import { useCatalog } from './useCatalog.hook';

const pikachu: Pokemon = { id: 25, name: 'pikachu', types: ['electric'], deprecated: false };

/** Answers the catalog requests with the given responses in order; the last one repeats. */
const mockCatalogResponses = (...responses: Pokemon[][]) => {
  const fetchMock = vi.fn(async () => {
    const body = responses[Math.min(fetchMock.mock.calls.length - 1, responses.length - 1)];
    return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
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
    const fetchMock = mockCatalogResponses([pikachu]);
    const { result } = renderCatalog();
    await waitFor(() => expect(result.current.data).toEqual([pikachu]));

    await act(() => vi.advanceTimersByTimeAsync(3 * CATALOG_SYNC_POLLING_MS));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('polls while the initial sync is running and stops once the catalog is filled', async () => {
    const fetchMock = mockCatalogResponses([], [pikachu]);
    const { result } = renderCatalog();
    await waitFor(() => expect(result.current.data).toEqual([]));

    await act(() => vi.advanceTimersByTimeAsync(CATALOG_SYNC_POLLING_MS));
    await waitFor(() => expect(result.current.data).toEqual([pikachu]));

    await act(() => vi.advanceTimersByTimeAsync(3 * CATALOG_SYNC_POLLING_MS));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
