import { describe, expect, it, vi } from 'vitest';
import {
  canRegister,
  eventDate,
  getEvent,
  isCompleted,
  normalizeEvent,
  searchEvents,
} from './ticketmaster';
import { apiEvent } from '../test/fixtures';

describe('Ticketmaster events', () => {
  it('maps API details and tolerates missing optional fields', () => {
    expect(normalizeEvent(apiEvent)).toMatchObject({
      name: 'Campus Concert',
      category: 'Music',
      venue: 'Town Hall',
      location: 'London, United Kingdom',
    });
    expect(normalizeEvent({ id: 'empty', name: 'Untitled' })).toMatchObject({
      image: '',
      date: '',
      venue: 'Venue to be announced',
      category: 'Other',
    });
    expect(eventDate(normalizeEvent({}))).toBe('Date to be announced');
  });

  it('distinguishes completed, upcoming, cancelled and unknown-date events', () => {
    const now = new Date('2026-10-11T12:00:00Z');
    expect(isCompleted({ dateTime: '2026-10-10T19:00:00Z' }, now)).toBe(true);
    expect(isCompleted({ dateTime: '2099-01-01T00:00:00Z' }, now)).toBe(false);
    expect(
      isCompleted({ dateTime: '2020-01-01T00:00:00Z', dateTba: true }, now),
    ).toBe(false);
    expect(
      isCompleted({ date: '2026-10-10', timezone: 'Europe/London' }, now),
    ).toBe(true);
    expect(canRegister({ status: 'cancelled' })).toBe(false);
    expect(canRegister({ status: 'postponed' })).toBe(false);
  });

  it('sends search filters, upcoming dates, and pagination to the API', async () => {
    vi.stubEnv('VITE_TICKETMASTER_API_KEY', 'test-key');
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _embedded: { events: [apiEvent] },
        page: { totalPages: 2, totalElements: 20 },
      }),
    });
    vi.stubGlobal('fetch', fetch);
    const result = await searchEvents({
      keyword: 'concert & music',
      classificationName: 'Music',
      city: 'London',
      countryCode: 'GB',
      page: 1,
    });
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('keyword')).toBe('concert & music');
    expect(url.searchParams.get('classificationName')).toBe('Music');
    expect(url.searchParams.get('city')).toBe('London');
    expect(url.searchParams.get('countryCode')).toBe('GB');
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('startDateTime')).toMatch(/T.*Z$/);
    expect(result.items[0].id).toBe('event-1');
    expect(result.totalPages).toBe(2);
  });

  it('handles empty results, missing keys, and API errors', async () => {
    vi.stubEnv('VITE_TICKETMASTER_API_KEY', '');
    await expect(searchEvents({})).rejects.toThrow('API key');
    vi.stubEnv('VITE_TICKETMASTER_API_KEY', 'test-key');
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetch);
    expect((await searchEvents({})).items).toEqual([]);
    fetch.mockResolvedValue({ ok: false, status: 429 });
    await expect(searchEvents({})).rejects.toThrow('Too many requests');
    fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(getEvent('missing')).rejects.toThrow('could not be found');
  });
});
