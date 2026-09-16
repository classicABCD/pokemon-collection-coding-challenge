import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRegisterMutation } from '../../api/pokemonApi';
import { EMPTY_CREDENTIALS, PASSWORD_HINT, USERNAME_HINT } from './auth.const';
import type { Credentials } from './auth.type';
import { registerErrors, validateNewPassword, validateNewUsername } from './auth.util';

/** Validates the rules of the API contract before sending; a taken username is shown at the username field. */
export const RegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string>();
  const form = useForm<Credentials>({
    mode: 'uncontrolled',
    initialValues: EMPTY_CREDENTIALS,
    validate: { username: validateNewUsername, password: validateNewPassword },
    validateInputOnBlur: true,
  });

  const handleSubmit = form.onSubmit(async (credentials) => {
    setFormError(undefined);
    try {
      await register({ registerRequest: credentials }).unwrap();
    } catch (error) {
      const errors = registerErrors(error);
      form.setErrors(errors.fields);
      setFormError(errors.form);
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack>
        <TextInput
          label="Username"
          description={USERNAME_HINT}
          autoComplete="username"
          withAsterisk
          key={form.key('username')}
          {...form.getInputProps('username')}
        />
        <PasswordInput
          label="Password"
          description={PASSWORD_HINT}
          autoComplete="new-password"
          withAsterisk
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        {formError && <Alert color="red">{formError}</Alert>}
        <Button type="submit" loading={isLoading}>
          Create account
        </Button>
      </Stack>
    </form>
  );
};
