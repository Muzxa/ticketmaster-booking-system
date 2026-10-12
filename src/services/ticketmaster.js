const baseUrl = 'https://app.ticketmaster.com/discovery/v2';

async function request(path, params, signal) {
  const key = import.meta.env.VITE_TICKETMASTER_API_KEY;
  if (!key || key === 'your_api_key_here') {
    throw new Error(
      'Add your Ticketmaster API key to .env and restart the development server.',
    );
  }
  const query = new URLSearchParams({ ...params, apikey: key });
  const response = await fetch(`${baseUrl}/${path}?${query}`, { signal });
  if (!response.ok) {
    const messages = {
      401: 'The Ticketmaster API key is invalid.',
      403: 'Ticketmaster denied access. Check your API key.',
      404: 'This event could not be found.',
      429: 'Too many requests. Please wait and try again.',
    };
    throw new Error(
      messages[response.status] || 'Could not load events. Please try again.',
    );
  }
  return response.json();
}

export async function searchEvents(filters, signal) {
  const params = {
    size: 12,
    page: filters.page || 0,
    sort: filters.sort || 'date,asc',
    startDateTime: new Date().toISOString().split('.')[0] + 'Z',
  };
  for (const key of ['keyword', 'city', 'countryCode', 'classificationName']) {
    if (filters[key]) params[key] = filters[key].trim();
  }
  if (filters.date && `${filters.date}T00:00:00Z` > params.startDateTime) {
    params.startDateTime = `${filters.date}T00:00:00Z`;
  }
  const data = await request('events.json', params, signal);
  return {
    items: (data._embedded?.events || []).map(normalizeEvent),
    totalPages: Math.min(data.page?.totalPages || 0, 83),
    total: data.page?.totalElements || 0,
  };
}

export async function getEvent(id, signal) {
  return normalizeEvent(
    await request(`events/${encodeURIComponent(id)}.json`, {}, signal),
  );
}

export function normalizeEvent(event) {
  const venue = event._embedded?.venues?.[0];
  const start = event.dates?.start;
  const end = event.dates?.end;
  return {
    id: event.id,
    name: event.name,
    date: start?.localDate || '',
    time: start?.timeTBA || start?.noSpecificTime ? '' : start?.localTime || '',
    dateTime: start?.dateTime || '',
    endDateTime: end?.dateTime || '',
    dateTba: !!(start?.dateTBA || start?.dateTBD),
    timezone: event.dates?.timezone || venue?.timezone || '',
    status: event.dates?.status?.code || '',
    venue: venue?.name || 'Venue to be announced',
    location: [venue?.city?.name, venue?.state?.name, venue?.country?.name]
      .filter(Boolean)
      .join(', '),
    address: venue?.address?.line1 || '',
    category: event.classifications?.[0]?.segment?.name || 'Other',
    genre: event.classifications?.[0]?.genre?.name || '',
    image:
      event.images?.find(
        (image) => image.ratio === '16_9' && image.width >= 500,
      )?.url ||
      event.images?.[0]?.url ||
      '',
    info: event.info || event.pleaseNote || '',
    price: event.priceRanges?.[0] || null,
    url: event.url || '',
  };
}

export function isCompleted(event, now = new Date()) {
  if (event.dateTba) return false;
  const end = event.endDateTime || event.dateTime;
  if (end) return new Date(end) < now;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: event.timezone || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return !!event.date && event.date < today;
}

export function canRegister(event) {
  return (
    !isCompleted(event) && !['cancelled', 'postponed'].includes(event.status)
  );
}

export function eventDate(event) {
  if (!event.date || event.dateTba) return 'Date to be announced';
  const date = new Date(`${event.date}T12:00:00`).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );
  return `${date}${event.time ? ` at ${event.time.slice(0, 5)}` : ' · time to be announced'}`;
}
