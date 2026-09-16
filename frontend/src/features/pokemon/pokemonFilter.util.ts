import type { Pokemon } from '../../api/pokemonApi';
import type { PokemonFilter, PokemonItem, SortKey, StatusFilter } from './pokemonFilter.type';

const matchesStatus = (pokemon: Pokemon, status: StatusFilter): boolean => {
  switch (status) {
    case 'available':
      return !pokemon.deprecated;
    case 'deprecated':
      return pokemon.deprecated;
    default:
      return true;
  }
};

const compare = (a: PokemonItem, b: PokemonItem, sortBy: SortKey): number => {
  switch (sortBy) {
    case 'name':
      return a.pokemon.name.localeCompare(b.pokemon.name);
    case 'addedAt':
      return (a.addedAt ?? '').localeCompare(b.addedAt ?? '') || a.pokemon.id - b.pokemon.id;
    default:
      return a.pokemon.id - b.pokemon.id;
  }
};

/**
 * Client-side filtering and sorting for catalog and collection (datasets are small).
 * Name matches case-insensitively as substring; all selected types must be present.
 */
export const filterAndSortPokemon = <T extends PokemonItem>(items: readonly T[], filter: PokemonFilter): T[] => {
  const name = filter.name.trim().toLowerCase();
  const factor = filter.direction === 'asc' ? 1 : -1;

  return items
    .filter((item) => !name || item.pokemon.name.toLowerCase().includes(name))
    .filter((item) => filter.types.every((type) => item.pokemon.types.includes(type)))
    .filter((item) => matchesStatus(item.pokemon, filter.status))
    .sort((a, b) => factor * compare(a, b, filter.sortBy));
};

/** Distinct, alphabetically sorted types of the given items (options for the type filter). */
export const availableTypes = (items: readonly PokemonItem[]): string[] =>
  [...new Set(items.flatMap((item) => item.pokemon.types))].sort();
