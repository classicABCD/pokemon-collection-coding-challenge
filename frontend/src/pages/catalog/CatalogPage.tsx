import { Alert, Center, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import { QUERY_OPTIONS } from '../../api/api.const';
import { errorMessage } from '../../api/errorMessage.util';
import { useAddToCollectionMutation, useListCollectionQuery, useListPokemonQuery } from '../../api/pokemonApi';
import { PokemonCard } from '../../features/pokemon/PokemonCard';
import { PokemonFilterBar } from '../../features/pokemon/PokemonFilterBar';
import { PokemonGrid } from '../../features/pokemon/PokemonGrid';
import { NO_MATCH_MESSAGE } from '../../features/pokemon/pokemon.const';
import { availableTypes, filterAndSortPokemon } from '../../features/pokemon/pokemonFilter.util';
import { usePokemonFilter } from '../../features/pokemon/usePokemonFilter.hook';
import { CATALOG_DEFAULT_SORT, CATALOG_LOADING_MESSAGE, CATALOG_SORT_OPTIONS, NO_POKEMON } from './catalogPage.const';

export const CatalogPage = () => {
  const { data: catalog = NO_POKEMON, isLoading, error } = useListPokemonQuery(undefined, QUERY_OPTIONS);
  const { data: collection } = useListCollectionQuery(undefined, QUERY_OPTIONS);
  const [addToCollection, addState] = useAddToCollectionMutation();
  const [filter, updateFilter] = usePokemonFilter(CATALOG_DEFAULT_SORT);

  const items = useMemo(() => catalog.map((pokemon) => ({ pokemon })), [catalog]);
  const visible = useMemo(() => filterAndSortPokemon(items, filter), [items, filter]);
  const typeOptions = useMemo(() => availableTypes(items), [items]);
  const ownedIds = useMemo(() => new Set(collection?.map((entry) => entry.pokemon.id)), [collection]);
  const addingId = addState.isLoading ? addState.originalArgs?.addToCollectionRequest.pokemonId : undefined;

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack>
      <Group justify="space-between" align="baseline">
        <Title order={2}>Catalog</Title>
        <Text c="dimmed" size="sm">
          {visible.length} of {catalog.length} Pokémon
        </Text>
      </Group>

      {error && <Alert color="red">{errorMessage(error)}</Alert>}
      {addState.isError && (
        <Alert color="red" withCloseButton onClose={() => addState.reset()}>
          {errorMessage(addState.error)}
        </Alert>
      )}

      {!error && catalog.length === 0 ? (
        // First sync still running after startup; polling picks up the data once it is there
        <Center py="xl">
          <Group>
            <Loader size="sm" />
            <Text c="dimmed">{CATALOG_LOADING_MESSAGE}</Text>
          </Group>
        </Center>
      ) : (
        <>
          <PokemonFilterBar
            filter={filter}
            onChange={updateFilter}
            typeOptions={typeOptions}
            sortOptions={CATALOG_SORT_OPTIONS}
          />
          <PokemonGrid
            key={JSON.stringify(filter)}
            items={visible}
            itemKey={(item) => item.pokemon.id}
            emptyMessage={NO_MATCH_MESSAGE}
            renderItem={({ pokemon }) => (
              <PokemonCard
                pokemon={pokemon}
                owned={ownedIds.has(pokemon.id)}
                adding={addingId === pokemon.id}
                onAdd={(pokemonId) => addToCollection({ addToCollectionRequest: { pokemonId } })}
              />
            )}
          />
        </>
      )}
    </Stack>
  );
};
