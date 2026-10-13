import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getEvent, searchEvents } from '../services/ticketmaster';

export const fetchEvents = createAsyncThunk(
  'events/search',
  (filters, { signal }) => searchEvents(filters, signal),
);
export const fetchEvent = createAsyncThunk('events/details', (id, { signal }) =>
  getEvent(id, signal),
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    total: 0,
    totalPages: 0,
    status: 'idle',
    error: '',
    selected: null,
    detailStatus: 'idle',
    detailError: '',
    searchRequest: null,
    detailRequest: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state, action) => {
        state.status = 'loading';
        state.error = '';
        state.searchRequest = action.meta.requestId;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        if (state.searchRequest !== action.meta.requestId) return;
        Object.assign(state, action.payload, { status: 'succeeded' });
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (state.searchRequest !== action.meta.requestId) return;
        state.status = action.meta.aborted ? 'idle' : 'failed';
        state.error = action.meta.aborted ? '' : action.error.message;
      })
      .addCase(fetchEvent.pending, (state, action) => {
        state.selected = null;
        state.detailStatus = 'loading';
        state.detailError = '';
        state.detailRequest = action.meta.requestId;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        if (state.detailRequest !== action.meta.requestId) return;
        state.selected = action.payload;
        state.detailStatus = 'succeeded';
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        if (state.detailRequest !== action.meta.requestId) return;
        state.detailStatus = action.meta.aborted ? 'idle' : 'failed';
        state.detailError = action.meta.aborted ? '' : action.error.message;
      });
  },
});

export default eventsSlice.reducer;
