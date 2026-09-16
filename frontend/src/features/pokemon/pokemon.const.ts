import type { SortDirection, StatusFilter } from './pokemonFilter.type';

export const PAGE_SIZE = 24;

export const PLACEHOLDER_SPRITE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="30" fill="none" stroke="#adb5bd" stroke-width="4"/><line x1="18" y1="48" x2="78" y2="48" stroke="#adb5bd" stroke-width="4"/><circle cx="48" cy="48" r="8" fill="#adb5bd"/></svg>',
)}`;

/** Mantine colors per Pokémon type; unknown types fall back to gray. */
export const TYPE_COLORS: Readonly<Record<string, string>> = {
  bug: 'lime',
  dark: 'dark',
  dragon: 'indigo',
  electric: 'yellow',
  fairy: 'pink',
  fighting: 'red',
  fire: 'orange',
  flying: 'cyan',
  ghost: 'grape',
  grass: 'green',
  ground: 'orange',
  ice: 'cyan',
  normal: 'gray',
  poison: 'violet',
  psychic: 'pink',
  rock: 'yellow',
  steel: 'gray',
  water: 'blue',
};

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'deprecated', label: 'Deprecated' },
];

export const DIRECTION_OPTIONS: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: 'Asc' },
  { value: 'desc', label: 'Desc' },
];

export const DEPRECATED_HINT = 'No longer available in PokéAPI';
export const NO_MATCH_MESSAGE = 'No Pokémon match your filters.';
