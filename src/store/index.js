import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import events from './eventsSlice';
import registrations from './registrationsSlice';
import { saveStorage } from './storage';

export const store = configureStore({
  reducer: { auth, events, registrations },
});
store.subscribe(() => {
  const state = store.getState();
  saveStorage('users', state.auth.users);
  saveStorage('user', state.auth.user);
  saveStorage('registrations', state.registrations.byUser);
});
