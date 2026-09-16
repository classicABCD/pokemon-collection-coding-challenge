export const APP_TITLE = 'Pokémon Collection';

export const COLOR_SCHEME_LABELS = { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' } as const;

export const NAVIGATION: { to: string; label: string }[] = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/collection', label: 'My collection' },
];
