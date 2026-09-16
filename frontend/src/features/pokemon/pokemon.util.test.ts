import { describe, expect, it } from 'vitest';
import { addButtonLabel, displayName, normalizeSearchText, typeBadges, typeFilterLabel } from './pokemon.util';

describe('displayName', () => {
  it('replaces dashes with spaces', () => {
    expect(displayName({ id: 122, name: 'mr-mime', types: ['psychic'], deprecated: false })).toBe('mr mime');
  });
});

describe('normalizeSearchText', () => {
  it('treats dashes and spaces alike and ignores case', () => {
    expect(normalizeSearchText('pikachu-world-cap')).toBe('pikachu world cap');
    expect(normalizeSearchText('  Pikachu   Wo ')).toBe('pikachu wo');
  });

  it('ignores accents', () => {
    expect(normalizeSearchText('Flabébé')).toBe('flabebe');
  });
});

describe('typeFilterLabel', () => {
  it('shows the number of selected types', () => {
    expect(typeFilterLabel([])).toBe('Types');
    expect(typeFilterLabel(['fire', 'water'])).toBe('Types (2)');
  });
});

describe('typeBadges', () => {
  it('limits the visible badges and counts the rest', () => {
    expect(typeBadges(['fire', 'water'], 3)).toEqual({ visible: ['fire', 'water'], hiddenCount: 0 });
    expect(typeBadges(['bug', 'dark', 'fire', 'ice', 'rock'], 3)).toEqual({
      visible: ['bug', 'dark', 'fire'],
      hiddenCount: 2,
    });
  });
});

describe('addButtonLabel', () => {
  it('prefers deprecated over owned', () => {
    expect(addButtonLabel(true, true)).toBe('Not available');
    expect(addButtonLabel(false, true)).toBe('In collection');
    expect(addButtonLabel(false, false)).toBe('Add');
  });
});
