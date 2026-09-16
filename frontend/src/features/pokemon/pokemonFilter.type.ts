import type { Pokemon } from '../../api/pokemonApi';

export type SortKey = 'id' | 'name' | 'addedAt';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'all' | 'available' | 'deprecated';

export interface PokemonFilter {
  name: string;
  types: string[];
  status: StatusFilter;
  sortBy: SortKey;
  direction: SortDirection;
}

export type PokemonSort = Pick<PokemonFilter, 'sortBy' | 'direction'>;

export interface SortOption {
  value: SortKey;
  label: string;
}

/** Catalog items only have a Pokémon; collection items also have the date they were added. */
export interface PokemonItem {
  pokemon: Pokemon;
  addedAt?: string;
}
