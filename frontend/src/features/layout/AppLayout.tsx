import { AppShell, Button, Container, Group, Text, Title } from '@mantine/core';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useLogoutMutation } from '../../api/pokemonApi';
import { useCurrentTrainer } from '../auth/useCurrentTrainer.hook';
import { APP_TITLE, NAVIGATION } from './layout.const';

export const AppLayout = () => {
  const { trainer } = useCurrentTrainer();
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  // The logout endpoint resets the cache on success (see pokemonApi.ts)
  const handleLogout = () =>
    logout()
      .unwrap()
      .then(() => navigate('/login', { replace: true }))
      .catch(() => undefined);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Title order={3}>{APP_TITLE}</Title>
              <Group gap={4} wrap="nowrap">
                {NAVIGATION.map((item) => (
                  <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <Button variant={isActive ? 'light' : 'subtle'} component="span">
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
              <Button variant="default" onClick={handleLogout} loading={isLoading}>
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
