import { AppShell, Button, Container, Group, Text, Title } from '@mantine/core';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { errorMessage, errorStatus } from '../../api/apiError.util';
import { useLogoutMutation } from '../../api/pokemonApi';
import { useCurrentTrainer } from '../auth/useCurrentTrainer.hook';
import { notifyError } from '../notification/notification.util';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { APP_TITLE, NAVIGATION } from './layout.const';

export const AppLayout = () => {
  const { trainer } = useCurrentTrainer();
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  // The logout endpoint resets the cache (see pokemonApi.ts)
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      if (errorStatus(error) === 401) {
        // Session had already expired: the trainer is logged out anyway
        navigate('/login', { replace: true });
      } else {
        notifyError(errorMessage(error));
      }
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%" px={{ base: 'xs', sm: 'md' }}>
          <Group h="100%" justify="space-between" wrap="nowrap" gap="xs">
            <Group gap="lg" wrap="nowrap">
              <Title order={3} visibleFrom="md">
                {APP_TITLE}
              </Title>
              <Group gap={2} wrap="nowrap">
                {NAVIGATION.map((item) => (
                  <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <Button variant={isActive ? 'light' : 'subtle'} component="span" size="compact-md" px="xs">
                        {item.label}
                      </Button>
                    )}
                  </NavLink>
                ))}
              </Group>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <Text size="sm" c="dimmed" visibleFrom="sm">
                {trainer?.username}
              </Text>
              <ColorSchemeToggle />
              <Button variant="default" size="compact-md" onClick={handleLogout} loading={isLoading}>
                Log out
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
