import { Alert, Center, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import { errorMessage } from '../../api/apiError.util';
import { useAddToCollectionMutation, useListCollectionQuery } from '../../api/pokemonApi';
import { notifyError } from '../../features/notification/notification.util';
import { PokemonCard } from '../../features/pokemon/PokemonCard';
import { PokemonFilterBar } from '../../features/pokemon/PokemonFilterBar';
import { PokemonGrid } from '../../features/pokemon/PokemonGrid';
import { NO_MATCH_MESSAGE } from '../../features/pokemon/pokemon.const';
import { availableTypes, filterAndSortPokemon } from '../../features/pokemon/pokemonFilter.util';
import { usePokemonFilter } from '../../features/pokemon/usePokemonFilter.hook';
import {
  CATALOG_DEFAULT_SORT,
  CATALOG_LOADING_MESSAGE,
  CATALOG_SORT_OPTIONS,
  CATALOG_SYNC_FAILED_MESSAGE,
  NO_POKEMON,
} from './catalogPage.const';
import { useCatalog } from './useCatalog.hook';

export const CatalogPage = () => {
  const { data: catalog = NO_POKEMON, isLoading, error, syncFailed } = useCatalog();
  const { data: collection } = useListCollectionQuery();
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

      {!error && catalog.length === 0 ? (
        // Initial sync running or retried by the backend; polling picks up the data once it is there
        syncFailed ? (
          <Alert color="yellow">{CATALOG_SYNC_FAILED_MESSAGE}</Alert>
        ) : (
          <Center py="xl">
            <Group>
              <Loader size="sm" />
              <Text c="dimmed">{CATALOG_LOADING_MESSAGE}</Text>
            </Group>
          </Center>
        )
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
                onAdd={(pokemonId) =>
                  addToCollection({ addToCollectionRequest: { pokemonId } })
                    .unwrap()
                    .catch((addError: unknown) => notifyError(errorMessage(addError)))
                }
              />
            )}
          />
        </>
      )}
    </Stack>
  );
};
