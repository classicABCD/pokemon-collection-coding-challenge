import { Badge, Button, Checkbox, Group, Popover, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { TYPE_CHECKBOX_STYLES, TYPE_COLORS, TYPE_FILTER_DROPDOWN, TYPE_FILTER_MAX_BADGES } from './pokemon.const';
import { typeBadges, typeFilterLabel } from './pokemon.util';

interface TypeFilterProps {
  options: string[];
  value: string[];
  onChange: (types: string[]) => void;
}

/** Compact type filter: a button with the selection count opens a checkbox list; selected types show as badges. */
export const TypeFilter = ({ options, value, onChange }: TypeFilterProps) => {
  const { visible, hiddenCount } = typeBadges(value, TYPE_FILTER_MAX_BADGES);

  return (
    <Group gap="xs" wrap="nowrap">
      <Popover position="bottom-start" shadow="md" width={TYPE_FILTER_DROPDOWN.width}>
        <Popover.Target>
          <Button variant="default" rightSection={<IconChevronDown size={16} stroke={1.5} />}>
            {typeFilterLabel(value)}
          </Button>
        </Popover.Target>
        <Popover.Dropdown maw={TYPE_FILTER_DROPDOWN.maxWidth}>
          <Stack gap="sm">
            <Checkbox.Group value={value} onChange={onChange} aria-label="Types">
              <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                {options.map((type) => (
                  <Checkbox
                    key={type}
                    value={type}
                    label={type}
                    color={TYPE_COLORS[type] ?? 'gray'}
                    styles={TYPE_CHECKBOX_STYLES}
                  />
                ))}
              </SimpleGrid>
            </Checkbox.Group>
            <Group justify="flex-end">
              <Button variant="subtle" size="xs" disabled={value.length === 0} onClick={() => onChange([])}>
                Clear
              </Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      {visible.map((type) => (
        <Badge key={type} size="sm" variant="light" color={TYPE_COLORS[type] ?? 'gray'}>
          {type}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Text size="xs" c="dimmed">
          +{hiddenCount}
        </Text>
      )}
    </Group>
  );
};
