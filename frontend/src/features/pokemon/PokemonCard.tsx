import { Badge, Button, Card, Group, Image, Stack, Text, Tooltip } from '@mantine/core';
import type { Pokemon } from '../../api/pokemonApi';
import { DEPRECATED_HINT, PLACEHOLDER_SPRITE, TYPE_COLORS } from './pokemon.const';
import { addButtonLabel, displayName } from './pokemon.util';

interface PokemonCardProps {
  pokemon: Pokemon;
  /** Shown in the collection. */
  addedAt?: string;
  /** Catalog only: renders the add button. */
  onAdd?: (pokemonId: number) => void;
  owned?: boolean;
  adding?: boolean;
}

export const PokemonCard = ({ pokemon, addedAt, onAdd, owned = false, adding = false }: PokemonCardProps) => (
  <Card withBorder radius="md" padding="sm" h="100%">
    <Stack gap={6} h="100%">
      <Group justify="space-between" wrap="nowrap" gap={4}>
        <Text size="xs" c="dimmed" truncate>
          #{pokemon.id}
        </Text>
        {pokemon.deprecated && (
          <Tooltip label={DEPRECATED_HINT}>
            <Badge color="red" variant="filled" size="xs" style={{ flexShrink: 0 }}>
              Deprecated
            </Badge>
          </Tooltip>
        )}
      </Group>

      <Image
        src={pokemon.spriteUrl ?? PLACEHOLDER_SPRITE}
        fallbackSrc={PLACEHOLDER_SPRITE}
        alt={pokemon.name}
        h={96}
        fit="contain"
        loading="lazy"
        style={pokemon.deprecated ? { filter: 'grayscale(1)', opacity: 0.5 } : undefined}
      />

      <Text fw={600} tt="capitalize" ta="center" lineClamp={1} td={pokemon.deprecated ? 'line-through' : undefined}>
        {displayName(pokemon)}
      </Text>

      <Group gap={4} justify="center">
        {pokemon.types.map((type) => (
          <Badge key={type} size="xs" variant="light" color={TYPE_COLORS[type] ?? 'gray'}>
            {type}
          </Badge>
        ))}
      </Group>

      {addedAt && (
        <Text size="xs" c="dimmed" ta="center">
          Added {new Date(addedAt).toLocaleDateString()}
        </Text>
      )}

      {onAdd && (
        <Button
          mt="auto"
          size="xs"
          fullWidth
          variant={owned || pokemon.deprecated ? 'default' : 'filled'}
          disabled={owned || pokemon.deprecated}
          loading={adding}
          onClick={() => onAdd(pokemon.id)}
        >
          {addButtonLabel(pokemon.deprecated, owned)}
        </Button>
      )}
    </Stack>
  </Card>
);
