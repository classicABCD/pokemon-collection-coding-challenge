import type { Pokemon } from '../../api/pokemonApi';
import type { PokemonSort, SortOption } from '../../features/pokemon/pokemonFilter.type';

/** Stable empty array, so memoized values don't recompute while loading. */
export const NO_POKEMON: Pokemon[] = [];

export const CATALOG_DEFAULT_SORT: PokemonSort = { sortBy: 'id', direction: 'asc' };

export const CATALOG_SORT_OPTIONS: SortOption[] = [
  { value: 'id', label: 'Pokédex number' },
  { value: 'name', label: 'Name' },
];

export const CATALOG_LOADING_MESSAGE = 'The catalog is being loaded from PokéAPI…';

export const CATALOG_SYNC_FAILED_MESSAGE =
  'PokéAPI is currently not reachable. The catalog is loaded automatically as soon as it is available again.';
