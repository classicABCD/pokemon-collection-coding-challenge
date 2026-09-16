import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { store } from '../../app/store';
import { AUTH_MESSAGES } from './auth.const';
import { RegisterForm } from './RegisterForm';

const renderForm = () =>
  render(
    <MantineProvider>
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    </MantineProvider>,
  );

const fillAndSubmit = (username: string, password: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('RegisterForm', () => {
  afterEach(() => vi.restoreAllMocks());

  it('explains invalid input at the field and sends no request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderForm();

    fillAndSubmit('ash ketchum', 'short');

    expect(await screen.findByText(AUTH_MESSAGES.usernameCharacters)).toBeInTheDocument();
    expect(screen.getByText(AUTH_MESSAGES.passwordTooShort)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
