export const apiEvent = {
  id: 'event-1',
  name: 'Campus Concert',
  dates: {
    start: {
      localDate: '2099-06-10',
      localTime: '19:00:00',
      dateTime: '2099-06-10T18:00:00Z',
    },
    timezone: 'Europe/London',
    status: { code: 'onsale' },
  },
  classifications: [{ segment: { name: 'Music' }, genre: { name: 'Rock' } }],
  _embedded: {
    venues: [
      {
        name: 'Town Hall',
        city: { name: 'London' },
        country: { name: 'United Kingdom' },
      },
    ],
  },
};
