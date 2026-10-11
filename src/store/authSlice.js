import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { readStorage } from './storage';

export const authenticate = createAsyncThunk(
  'auth/authenticate',
  async (
    { name = '', email, password, register },
    { getState, rejectWithValue },
  ) => {
    email = email.trim().toLowerCase();
    name = name.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      return rejectWithValue(
        'Enter a valid email and a password of at least 6 characters.',
      );
    }
    if (register && !name) return rejectWithValue('Enter your name.');
    const { users } = getState().auth;
    const existing = users.find((user) => user.email === email);
    if (register && existing)
      return rejectWithValue('An account with this email already exists.');
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password),
    );
    const passwordHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    if (!register && (!existing || existing.passwordHash !== passwordHash)) {
      return rejectWithValue('Email or password is incorrect.');
    }
    return {
      user: { name: register ? name : existing.name, email },
      account: register ? { name, email, passwordHash } : null,
    };
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    users: readStorage('users', []),
    user: readStorage('user', null),
    status: 'idle',
    error: '',
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.error = '';
    },
    clearAuthError(state) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticate.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(authenticate.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.user = payload.user;
        if (payload.account) state.users.push(payload.account);
      })
      .addCase(authenticate.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'Unable to sign in. Please try again.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
