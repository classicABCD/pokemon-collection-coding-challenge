import { describe, expect, it } from 'vitest';
import { addButtonLabel, displayName } from './pokemon.util';

describe('displayName', () => {
  it('replaces dashes with spaces', () => {
    expect(displayName({ id: 122, name: 'mr-mime', types: ['psychic'], deprecated: false })).toBe('mr mime');
  });
});

describe('addButtonLabel', () => {
  it('prefers deprecated over owned', () => {
    expect(addButtonLabel(true, true)).toBe('Not available');
    expect(addButtonLabel(false, true)).toBe('In collection');
    expect(addButtonLabel(false, false)).toBe('Add');
  });
});
