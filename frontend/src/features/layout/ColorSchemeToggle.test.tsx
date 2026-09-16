import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { COLOR_SCHEME_LABELS } from './layout.const';

describe('ColorSchemeToggle', () => {
  it('switches between light and dark mode', async () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <ColorSchemeToggle />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: COLOR_SCHEME_LABELS.toDark }));

    expect(await screen.findByRole('button', { name: COLOR_SCHEME_LABELS.toLight })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });
});
