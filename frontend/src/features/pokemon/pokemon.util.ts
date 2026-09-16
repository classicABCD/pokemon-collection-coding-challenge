import type { Pokemon } from '../../api/pokemonApi';

/** Display name, e.g. "mr-mime" → "mr mime" (capitalized via CSS). */
export const displayName = (pokemon: Pokemon): string => pokemon.name.replaceAll('-', ' ');

/**
 * Comparable form for name search: lowercase, accents removed, dashes and repeated whitespace collapsed to one space.
 * "Pikachu  Wo" and "pikachu-world-cap" both start with "pikachu wo"; "Flabébé" matches "flabebe".
 */
export const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[-\s]+/g, ' ')
    .trim();

/** Label of the type filter button, e.g. "Types" or "Types (2)". */
export const typeFilterLabel = (selectedTypes: readonly string[]): string =>
  selectedTypes.length ? `Types (${selectedTypes.length})` : 'Types';

/** Splits selected types into visible badges and the number of hidden ones. */
export const typeBadges = (selectedTypes: readonly string[], maxBadges: number) => ({
  visible: selectedTypes.slice(0, maxBadges),
  hiddenCount: Math.max(0, selectedTypes.length - maxBadges),
});

export const addButtonLabel = (deprecated: boolean, owned: boolean): string => {
  if (deprecated) {
    return 'Not available';
  }
  return owned ? 'In collection' : 'Add';
};
