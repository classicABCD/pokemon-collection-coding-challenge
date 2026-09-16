import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TypeFilter } from './TypeFilter';

const renderFilter = (value: string[], onChange = vi.fn()) => {
  render(
    <MantineProvider>
      <TypeFilter options={['electric', 'fire', 'water']} value={value} onChange={onChange} />
    </MantineProvider>,
  );
  return onChange;
};

describe('TypeFilter', () => {
  it('selects a type from the popover', async () => {
    const onChange = renderFilter([]);

    fireEvent.click(screen.getByRole('button', { name: 'Types' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'fire' }));

    expect(onChange).toHaveBeenCalledWith(['fire']);
  });

  it('shows the selection on the button and as badges', () => {
    renderFilter(['fire', 'water']);

    expect(screen.getByRole('button', { name: 'Types (2)' })).toBeInTheDocument();
    expect(screen.getByText('fire')).toBeInTheDocument();
    expect(screen.getByText('water')).toBeInTheDocument();
  });

  it('clears the selection', async () => {
    const onChange = renderFilter(['fire']);

    fireEvent.click(screen.getByRole('button', { name: 'Types (1)' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
