import { Center, Pagination, SimpleGrid, Stack, Text } from '@mantine/core';
import { type ReactNode, useState } from 'react';
import { PAGE_SIZE } from './pokemon.const';

interface PokemonGridProps<T> {
  items: T[];
  itemKey: (item: T) => number;
  renderItem: (item: T) => ReactNode;
  emptyMessage: ReactNode;
}

/** Client-side paginated grid. Remount it (via `key`) when the filter changes to jump back to page 1. */
export const PokemonGrid = <T,>({ items, itemKey, renderItem, emptyMessage }: PokemonGridProps<T>) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (items.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }} spacing="sm">
        {visible.map((item) => (
          <div key={itemKey(item)}>{renderItem(item)}</div>
        ))}
      </SimpleGrid>
      {totalPages > 1 && (
        <Center>
          <Pagination total={totalPages} value={currentPage} onChange={setPage} />
        </Center>
      )}
    </Stack>
  );
};
