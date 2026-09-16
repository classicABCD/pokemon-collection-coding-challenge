import type { Pokemon } from '../../api/pokemonApi';

/** Display name, e.g. "mr-mime" → "mr mime" (capitalized via CSS). */
export const displayName = (pokemon: Pokemon): string => pokemon.name.replaceAll('-', ' ');

export const addButtonLabel = (deprecated: boolean, owned: boolean): string => {
  if (deprecated) {
    return 'Not available';
  }
  return owned ? 'In collection' : 'Add';
};
