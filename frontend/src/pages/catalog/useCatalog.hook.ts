import { CATALOG_SYNC_POLLING_MS } from '../../api/api.const';
import { pokemonApi, useListPokemonQuery } from '../../api/pokemonApi';

/**
 * The catalog query. Polls only while the loaded catalog is empty (initial sync still running) and stops as soon as
 * it has data: every request extends the session, so permanent polling would disable the idle timeout.
 */
export const useCatalog = () => {
  // Reads the cached catalog to decide on polling before subscribing with that interval
  const pollingOptions = pokemonApi.endpoints.listPokemon.useQueryState(undefined, {
    selectFromResult: ({ data }) => ({ pollingInterval: data?.length === 0 ? CATALOG_SYNC_POLLING_MS : 0 }),
  });
  return useListPokemonQuery(undefined, pollingOptions);
};
