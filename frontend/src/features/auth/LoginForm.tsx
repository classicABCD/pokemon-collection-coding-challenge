import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useLoginMutation } from '../../api/pokemonApi';
import { EMPTY_CREDENTIALS } from './auth.const';
import type { Credentials } from './auth.type';
import { loginErrors, validateLoginPassword, validateLoginUsername } from './auth.util';

/** On success the session query is invalidated and the login page redirects (see pokemonApi.ts). */
export const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string>();
  const form = useForm<Credentials>({
    mode: 'uncontrolled',
    initialValues: EMPTY_CREDENTIALS,
    validate: { username: validateLoginUsername, password: validateLoginPassword },
  });

  const handleSubmit = form.onSubmit(async (credentials) => {
    setFormError(undefined);
    try {
      await login({ loginRequest: credentials }).unwrap();
    } catch (error) {
      const errors = loginErrors(error);
      form.setErrors(errors.fields);
      setFormError(errors.form);
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack>
        <TextInput
          label="Username"
          autoComplete="username"
          withAsterisk
          key={form.key('username')}
          {...form.getInputProps('username')}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          withAsterisk
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        {formError && <Alert color="red">{formError}</Alert>}
        <Button type="submit" loading={isLoading}>
          Log in
        </Button>
      </Stack>
    </form>
  );
};
