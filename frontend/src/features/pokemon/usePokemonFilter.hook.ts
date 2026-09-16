import { useCallback, useState } from 'react';
import type { PokemonFilter, PokemonSort } from './pokemonFilter.type';

export const usePokemonFilter = (initialSort: PokemonSort) => {
  const [filter, setFilter] = useState<PokemonFilter>({ name: '', types: [], status: 'all', ...initialSort });
  const updateFilter = useCallback(
    (changes: Partial<PokemonFilter>) => setFilter((current) => ({ ...current, ...changes })),
    [],
  );
  return [filter, updateFilter] as const;
};
