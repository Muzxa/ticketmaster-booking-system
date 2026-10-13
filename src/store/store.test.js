import { configureStore } from '@reduxjs/toolkit';
import { webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import auth, { authenticate, logout } from './authSlice';
import registrations, {
  addRegistration,
  cancelRegistration,
} from './registrationsSlice';
import events, { fetchEvents } from './eventsSlice';
import { normalizeEvent } from '../services/ticketmaster';
import { apiEvent } from '../test/fixtures';

describe('accounts and registrations', () => {
  it('registers, logs out, and logs in with normalized email and hashed passwords', async () => {
    vi.stubGlobal('crypto', webcrypto);
    const store = configureStore({ reducer: { auth } });
    await store.dispatch(
      authenticate({
        name: ' Student ',
        email: 'STUDENT@example.com',
        password: 'test123',
        register: true,
      }),
    );
    expect(store.getState().auth.user).toEqual({
      name: 'Student',
      email: 'student@example.com',
    });
    expect(store.getState().auth.users[0].passwordHash).not.toBe('test123');
    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    await store.dispatch(
      authenticate({ email: 'student@example.com', password: 'wrong123' }),
    );
    expect(store.getState().auth.error).toMatch(/incorrect/);
    await store.dispatch(
      authenticate({ email: 'student@example.com', password: 'test123' }),
    );
    expect(store.getState().auth.user.name).toBe('Student');
    await store.dispatch(
      authenticate({
        name: 'Other',
        email: 'student@example.com',
        password: 'test123',
        register: true,
      }),
    );
    expect(store.getState().auth.error).toMatch(/already exists/);
    expect(store.getState().auth.users).toHaveLength(1);
  });

  it('rejects invalid registration values', async () => {
    const store = configureStore({ reducer: { auth } });
    await store.dispatch(
      authenticate({
        name: ' ',
        email: 'student@example.com',
        password: 'test123',
        register: true,
      }),
    );
    expect(store.getState().auth.error).toBe('Enter your name.');
    await store.dispatch(
      authenticate({ email: 'bad', password: 'short', register: true }),
    );
    expect(store.getState().auth.user).toBeNull();
  });

  it('prevents duplicates, separates users, and cancels only upcoming registrations', () => {
    const store = configureStore({ reducer: { registrations } });
    const event = normalizeEvent(apiEvent);
    store.dispatch(addRegistration({ email: 'first@example.com', event }));
    store.dispatch(addRegistration({ email: 'first@example.com', event }));
    store.dispatch(addRegistration({ email: 'second@example.com', event }));
    expect(
      store.getState().registrations.byUser['first@example.com'],
    ).toHaveLength(1);
    store.dispatch(
      cancelRegistration({ email: 'first@example.com', id: event.id }),
    );
    expect(
      store.getState().registrations.byUser['first@example.com'],
    ).toHaveLength(0);
    expect(
      store.getState().registrations.byUser['second@example.com'],
    ).toHaveLength(1);
    store.dispatch(
      addRegistration({
        email: 'first@example.com',
        event: { ...event, dateTime: '2020-01-01T00:00:00Z' },
      }),
    );
    expect(
      store.getState().registrations.byUser['first@example.com'],
    ).toHaveLength(0);
    const past = { ...event, dateTime: '2020-01-01T00:00:00Z' };
    const state = { byUser: { 'first@example.com': [past] } };
    expect(
      registrations(
        state,
        cancelRegistration({ email: 'first@example.com', id: past.id }),
      ).byUser['first@example.com'],
    ).toHaveLength(1);
  });

  it('restores persisted accounts, sessions, and registrations after reload', async () => {
    localStorage.setItem(
      'users',
      JSON.stringify([
        {
          name: 'Student',
          email: 'student@example.com',
          passwordHash: 'fixture',
        },
      ]),
    );
    localStorage.setItem(
      'user',
      JSON.stringify({ name: 'Student', email: 'student@example.com' }),
    );
    localStorage.setItem(
      'registrations',
      JSON.stringify({ 'student@example.com': [normalizeEvent(apiEvent)] }),
    );
    vi.resetModules();
    const { store } = await import('./index');
    expect(store.getState().auth.user.name).toBe('Student');
    expect(
      store.getState().registrations.byUser['student@example.com'],
    ).toHaveLength(1);
    store.dispatch(logout());
    expect(JSON.parse(localStorage.getItem('user'))).toBeNull();
    expect(JSON.parse(localStorage.getItem('users'))).toHaveLength(1);
    expect(
      JSON.parse(localStorage.getItem('registrations'))['student@example.com'],
    ).toHaveLength(1);
  });

  it('ignores older search responses after a new search starts', () => {
    let state = events(undefined, fetchEvents.pending('old', {}));
    state = events(state, fetchEvents.pending('new', {}));
    state = events(
      state,
      fetchEvents.fulfilled(
        { items: [normalizeEvent(apiEvent)], total: 1, totalPages: 1 },
        'old',
        {},
      ),
    );
    expect(state.status).toBe('loading');
    expect(state.items).toHaveLength(0);
  });
});
