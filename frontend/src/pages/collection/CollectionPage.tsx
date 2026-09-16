import { Alert, Anchor, Center, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { QUERY_OPTIONS } from '../../api/api.const';
import { errorMessage } from '../../api/errorMessage.util';
import { useListCollectionQuery } from '../../api/pokemonApi';
import { PokemonCard } from '../../features/pokemon/PokemonCard';
import { PokemonFilterBar } from '../../features/pokemon/PokemonFilterBar';
import { PokemonGrid } from '../../features/pokemon/PokemonGrid';
import { NO_MATCH_MESSAGE } from '../../features/pokemon/pokemon.const';
import { availableTypes, filterAndSortPokemon } from '../../features/pokemon/pokemonFilter.util';
import { usePokemonFilter } from '../../features/pokemon/usePokemonFilter.hook';
import { COLLECTION_DEFAULT_SORT, COLLECTION_SORT_OPTIONS, NO_ENTRIES } from './collectionPage.const';

export const CollectionPage = () => {
  const { data: collection = NO_ENTRIES, isLoading, error } = useListCollectionQuery(undefined, QUERY_OPTIONS);
  const [filter, updateFilter] = usePokemonFilter(COLLECTION_DEFAULT_SORT);

  const visible = useMemo(() => filterAndSortPokemon(collection, filter), [collection, filter]);
  const typeOptions = useMemo(() => availableTypes(collection), [collection]);
  const deprecatedCount = collection.filter((entry) => entry.pokemon.deprecated).length;

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
        <Title order={2}>My collection</Title>
        <Text c="dimmed" size="sm">
          {visible.length} of {collection.length} Pokémon
          {deprecatedCount > 0 && ` · ${deprecatedCount} deprecated`}
        </Text>
      </Group>

      {error && <Alert color="red">{errorMessage(error)}</Alert>}

      {collection.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed">
            Your collection is empty.{' '}
            <Anchor component={Link} to="/catalog">
              Add Pokémon from the catalog
            </Anchor>
            .
          </Text>
        </Center>
      ) : (
        <>
          <PokemonFilterBar
            filter={filter}
            onChange={updateFilter}
            typeOptions={typeOptions}
            sortOptions={COLLECTION_SORT_OPTIONS}
          />
          <PokemonGrid
            key={JSON.stringify(filter)}
            items={visible}
            itemKey={(entry) => entry.pokemon.id}
            emptyMessage={NO_MATCH_MESSAGE}
            renderItem={(entry) => <PokemonCard pokemon={entry.pokemon} addedAt={entry.addedAt} />}
          />
        </>
      )}
    </Stack>
  );
};
