import { createSlice } from '@reduxjs/toolkit';
import { canRegister, isCompleted } from '../services/ticketmaster';
import { readStorage } from './storage';

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: { byUser: readStorage('registrations', {}) },
  reducers: {
    addRegistration(state, { payload: { email, event } }) {
      if (!email || !canRegister(event)) return;
      const events = (state.byUser[email] ||= []);
      if (!events.some((item) => item.id === event.id)) events.push(event);
    },
    cancelRegistration(state, { payload: { email, id } }) {
      state.byUser[email] = (state.byUser[email] || []).filter(
        (event) => event.id !== id || isCompleted(event),
      );
    },
  },
});

export const { addRegistration, cancelRegistration } =
  registrationsSlice.actions;
export default registrationsSlice.reducer;
