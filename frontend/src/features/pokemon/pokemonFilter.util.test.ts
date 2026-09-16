import { describe, expect, it } from 'vitest';
import type { Pokemon } from '../../api/pokemonApi';
import type { PokemonFilter } from './pokemonFilter.type';
import { availableTypes, filterAndSortPokemon } from './pokemonFilter.util';

const pokemon = (id: number, name: string, types: string[], deprecated = false): Pokemon => ({
  id,
  name,
  types,
  deprecated,
});

const items = [
  { pokemon: pokemon(25, 'pikachu', ['electric']), addedAt: '2026-09-02T10:00:00Z' },
  { pokemon: pokemon(1, 'bulbasaur', ['grass', 'poison']), addedAt: '2026-09-03T10:00:00Z' },
  { pokemon: pokemon(43, 'oddish', ['grass', 'poison'], true), addedAt: '2026-09-01T10:00:00Z' },
  { pokemon: pokemon(26, 'raichu', ['electric']), addedAt: '2026-09-04T10:00:00Z' },
];

const noFilter: PokemonFilter = { name: '', types: [], status: 'all', sortBy: 'id', direction: 'asc' };

const ids = (result: typeof items) => result.map((item) => item.pokemon.id);

describe('filterAndSortPokemon', () => {
  it('returns all items sorted by id without filters', () => {
    expect(ids(filterAndSortPokemon(items, noFilter))).toEqual([1, 25, 26, 43]);
  });

  it('filters by name case-insensitively as substring', () => {
    expect(ids(filterAndSortPokemon(items, { ...noFilter, name: '  CHU ' }))).toEqual([25, 26]);
  });

  it('requires all selected types', () => {
    expect(ids(filterAndSortPokemon(items, { ...noFilter, types: ['grass', 'poison'] }))).toEqual([1, 43]);
    expect(ids(filterAndSortPokemon(items, { ...noFilter, types: ['grass', 'electric'] }))).toEqual([]);
  });

  it('filters by deprecation status', () => {
    expect(ids(filterAndSortPokemon(items, { ...noFilter, status: 'available' }))).toEqual([1, 25, 26]);
    expect(ids(filterAndSortPokemon(items, { ...noFilter, status: 'deprecated' }))).toEqual([43]);
  });

  it('sorts by name and by date added in both directions', () => {
    expect(ids(filterAndSortPokemon(items, { ...noFilter, sortBy: 'name' }))).toEqual([1, 43, 25, 26]);
    expect(ids(filterAndSortPokemon(items, { ...noFilter, sortBy: 'addedAt', direction: 'desc' }))).toEqual([
      26, 1, 25, 43,
    ]);
  });

  it('does not mutate the input', () => {
    const copy = [...items];
    filterAndSortPokemon(items, { ...noFilter, direction: 'desc' });
    expect(items).toEqual(copy);
  });
});

describe('availableTypes', () => {
  it('returns distinct types alphabetically', () => {
    expect(availableTypes(items)).toEqual(['electric', 'grass', 'poison']);
  });
});
