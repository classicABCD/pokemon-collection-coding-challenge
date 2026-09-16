import { Group, MultiSelect, SegmentedControl, Select, TextInput } from '@mantine/core';
import { DIRECTION_OPTIONS, STATUS_OPTIONS } from './pokemon.const';
import type { PokemonFilter, SortDirection, SortKey, SortOption, StatusFilter } from './pokemonFilter.type';

interface PokemonFilterBarProps {
  filter: PokemonFilter;
  onChange: (changes: Partial<PokemonFilter>) => void;
  typeOptions: string[];
  sortOptions: SortOption[];
}

export const PokemonFilterBar = ({ filter, onChange, typeOptions, sortOptions }: PokemonFilterBarProps) => (
  <Group align="end" gap="sm">
    <TextInput
      label="Name"
      placeholder="Search by name"
      value={filter.name}
      onChange={(event) => onChange({ name: event.currentTarget.value })}
      w={200}
    />
    <MultiSelect
      label="Types"
      placeholder={filter.types.length ? undefined : 'All types'}
      data={typeOptions}
      value={filter.types}
      onChange={(types) => onChange({ types })}
      searchable
      clearable
      w={240}
    />
    <SegmentedControl
      value={filter.status}
      onChange={(status) => onChange({ status: status as StatusFilter })}
      data={STATUS_OPTIONS}
    />
    <Select
      label="Sort by"
      data={sortOptions}
      value={filter.sortBy}
      onChange={(sortBy) => sortBy && onChange({ sortBy: sortBy as SortKey })}
      allowDeselect={false}
      w={170}
    />
    <SegmentedControl
      value={filter.direction}
      onChange={(direction) => onChange({ direction: direction as SortDirection })}
      data={DIRECTION_OPTIONS}
    />
  </Group>
);
