import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Pokemon } from '../../api/pokemonApi';
import { PokemonCard } from './PokemonCard';

const pikachu: Pokemon = { id: 25, name: 'pikachu', types: ['electric'], deprecated: false };

const renderCard = (props: Parameters<typeof PokemonCard>[0]) =>
  render(
    <MantineProvider>
      <PokemonCard {...props} />
    </MantineProvider>,
  );

describe('PokemonCard', () => {
  it('lets the trainer add an available Pokémon', () => {
    const onAdd = vi.fn();
    renderCard({ pokemon: pikachu, onAdd });

    expect(screen.queryByText('Deprecated')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith(25);
  });

  it('marks a deprecated Pokémon and does not allow adding it', () => {
    renderCard({ pokemon: { ...pikachu, deprecated: true }, onAdd: vi.fn() });

    expect(screen.getByText('Deprecated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not available' })).toBeDisabled();
  });

  it('disables adding a Pokémon that is already owned', () => {
    renderCard({ pokemon: pikachu, onAdd: vi.fn(), owned: true });

    expect(screen.getByRole('button', { name: 'In collection' })).toBeDisabled();
  });

  it('shows no add button in the collection', () => {
    renderCard({ pokemon: { ...pikachu, deprecated: true }, addedAt: '2026-09-16T10:00:00Z' });

    expect(screen.getByText('Deprecated')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
