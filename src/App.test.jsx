import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import auth from './store/authSlice';
import events from './store/eventsSlice';
import registrations from './store/registrationsSlice';
import { normalizeEvent } from './services/ticketmaster';
import { apiEvent } from './test/fixtures';

function renderApp(path, preloadedState) {
  const store = configureStore({
    reducer: { auth, events, registrations },
    preloadedState,
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

describe('application flows', () => {
  it('protects My Events and links to account registration', async () => {
    renderApp('/my-events');
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(screen.getByRole('main')).getByRole('link', { name: 'Register' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Create an account' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeRequired();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('shows loading, API failures, retry, and empty results', async () => {
    vi.stubEnv('VITE_TICKETMASTER_API_KEY', 'test-key');
    let resolve;
    const fetch = vi.fn().mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal('fetch', fetch);
    renderApp('/events');
    expect(screen.getByRole('status')).toHaveTextContent('Loading events');
    resolve({ ok: false, status: 429 });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many requests',
    );
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No events found/)).toBeInTheDocument();
  });

  it('registers from details once and cancels from My Events', async () => {
    vi.stubEnv('VITE_TICKETMASTER_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => apiEvent }),
    );
    const store = renderApp('/events/event-1', {
      auth: {
        users: [],
        user: { name: 'Student', email: 'student@example.com' },
        status: 'idle',
        error: '',
      },
    });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Register for event' }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('You are registered');
    expect(
      screen.getByRole('button', { name: 'Cancel registration' }),
    ).toBeInTheDocument();
    expect(
      store.getState().registrations.byUser['student@example.com'],
    ).toHaveLength(1);
    await userEvent.click(screen.getByRole('link', { name: 'My Events' }));
    expect(
      screen.getByRole('heading', { name: 'Upcoming (1)' }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel registration' }),
    );
    expect(
      screen.getByText(/You have no registered events/),
    ).toBeInTheDocument();
    expect(
      store.getState().registrations.byUser['student@example.com'],
    ).toHaveLength(0);
  });

  it('separates completed events and other users’ registrations', async () => {
    const event = normalizeEvent(apiEvent);
    renderApp('/my-events', {
      auth: {
        users: [],
        user: { name: 'Student', email: 'student@example.com' },
        status: 'idle',
        error: '',
      },
      registrations: {
        byUser: {
          'student@example.com': [
            event,
            {
              ...event,
              id: 'past',
              name: 'Past Concert',
              dateTime: '2020-01-01T00:00:00Z',
            },
          ],
          'other@example.com': [{ ...event, name: 'Private Event' }],
        },
      },
    });
    expect(
      screen.getByRole('heading', { name: 'Completed (1)' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Private Event')).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Cancel registration' }),
    ).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Login' }),
      ).toBeInTheDocument(),
    );
  });
});
