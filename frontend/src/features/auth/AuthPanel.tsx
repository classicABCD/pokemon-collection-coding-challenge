import { Paper, SegmentedControl, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { APP_TITLE } from '../layout/layout.const';
import { AUTH_MODE_OPTIONS } from './auth.const';
import type { AuthMode } from './auth.type';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPanel = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <Paper withBorder shadow="sm" p="xl" radius="md" w={400} maw="100%">
      <Stack>
        <Title order={2} ta="center">
          {APP_TITLE}
        </Title>
        <SegmentedControl value={mode} onChange={(value) => setMode(value as AuthMode)} data={AUTH_MODE_OPTIONS} />
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </Stack>
    </Paper>
  );
};
