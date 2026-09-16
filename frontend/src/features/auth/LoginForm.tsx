import { Alert, Button, Paper, PasswordInput, SegmentedControl, Stack, TextInput, Title } from '@mantine/core';
import { type FormEvent, useState } from 'react';
import { errorMessage } from '../../api/errorMessage.util';
import { useLoginMutation, useRegisterMutation } from '../../api/pokemonApi';
import { APP_TITLE } from '../layout/layout.const';
import { AUTH_MODE_OPTIONS, PASSWORD_HINT, USERNAME_HINT } from './auth.const';
import type { AuthMode } from './auth.type';

/** Login and registration in one form. Success invalidates the session query (see pokemonApi.ts). */
export const LoginForm = () => {
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isRegister = mode === 'register';
  const current = isRegister ? registerState : loginState;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const credentials = { username, password };
    if (isRegister) {
      register({ registerRequest: credentials });
    } else {
      login({ loginRequest: credentials });
    }
  };

  return (
    <Paper withBorder shadow="sm" p="xl" radius="md" w={380}>
      <form onSubmit={submit}>
        <Stack>
          <Title order={2} ta="center">
            {APP_TITLE}
          </Title>
          <SegmentedControl value={mode} onChange={(value) => setMode(value as AuthMode)} data={AUTH_MODE_OPTIONS} />
          <TextInput
            label="Username"
            required
            autoComplete="username"
            description={isRegister ? USERNAME_HINT : undefined}
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            description={isRegister ? PASSWORD_HINT : undefined}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          {current.isError && <Alert color="red">{errorMessage(current.error)}</Alert>}
          <Button type="submit" loading={current.isLoading}>
            {isRegister ? 'Create account' : 'Log in'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
