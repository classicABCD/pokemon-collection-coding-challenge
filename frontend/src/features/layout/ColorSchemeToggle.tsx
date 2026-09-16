import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { COLOR_SCHEME_LABELS } from './layout.const';

/** Switches between light and dark mode; Mantine persists the choice in localStorage. */
export const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const isDark = useComputedColorScheme('light', { getInitialValueInEffect: true }) === 'dark';
  const label = isDark ? COLOR_SCHEME_LABELS.toLight : COLOR_SCHEME_LABELS.toDark;

  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="default"
        size="lg"
        aria-label={label}
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? <IconSun size={18} stroke={1.5} /> : <IconMoonStars size={18} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
};
