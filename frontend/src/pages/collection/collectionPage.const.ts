import type { CollectionEntry } from '../../api/pokemonApi';
import type { PokemonSort, SortOption } from '../../features/pokemon/pokemonFilter.type';

/** Stable empty array, so memoized values don't recompute while loading. */
export const NO_ENTRIES: CollectionEntry[] = [];

export const COLLECTION_DEFAULT_SORT: PokemonSort = { sortBy: 'addedAt', direction: 'desc' };

export const COLLECTION_SORT_OPTIONS: SortOption[] = [
  { value: 'addedAt', label: 'Date added' },
  { value: 'id', label: 'Pokédex number' },
  { value: 'name', label: 'Name' },
];
