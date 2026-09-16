import { CATALOG_SYNC_POLLING_MS } from '../../api/api.const';
import { pokemonApi, useGetCatalogSyncStatusQuery, useListPokemonQuery } from '../../api/pokemonApi';

/**
 * The catalog query. Polls only while the loaded catalog is empty (initial sync running or retried by the backend)
 * and stops as soon as it has data: every request extends the session, so permanent polling would disable the idle
 * timeout. While empty, the sync status tells "still loading" apart from "PokéAPI unreachable".
 */
export const useCatalog = () => {
  // Reads the cached catalog to decide on polling before subscribing with that interval
  const { isEmpty } = pokemonApi.endpoints.listPokemon.useQueryState(undefined, {
    selectFromResult: ({ data }) => ({ isEmpty: data?.length === 0 }),
  });
  const pollingInterval = isEmpty ? CATALOG_SYNC_POLLING_MS : 0;

  const catalogQuery = useListPokemonQuery(undefined, { pollingInterval });
  const { data: syncStatus } = useGetCatalogSyncStatusQuery(undefined, { skip: !isEmpty, pollingInterval });

  return { ...catalogQuery, syncFailed: isEmpty && syncStatus?.state === 'failed' };
};
