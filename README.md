# Event Management System

Web Programming Assignment 2: a React frontend using Redux Toolkit, React Router, Bootstrap, and the Ticketmaster Discovery API.

## Run locally

Use Node.js 22.12+ (or 20.19+) and npm.

```sh
npm install
cp .env.example .env
```

Get a Consumer Key from the [Ticketmaster developer portal](https://developer.ticketmaster.com/) and replace `your_api_key_here` in `.env`:

```dotenv
VITE_TICKETMASTER_API_KEY=your_api_key_here
```

```sh
npm run dev
```

Open the local URL printed by Vite. Restart the server after changing `.env`. Event data comes from Ticketmaster; there is no built-in demo catalog.

## Commands

| Command           | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the development server                  |
| `npm run build`   | Build into `dist/`                            |
| `npm run preview` | Preview the production build                  |
| `npm test`        | Run Vitest and React Testing Library tests    |
| `npm run lint`    | Run ESLint                                    |
| `npm run format`  | Format source and configuration with Prettier |

## Features

- Register with name, email, and password; login and logout. Redux manages the session, which survives refresh through local storage.
- Browse upcoming events; search by keyword and filter by category, city, country, and start date. Sort and page through results.
- View event name, venue-local date/time, location, category, image, status, and available additional details.
- Logged-in users can register once per event and cancel upcoming registrations. Completed, cancelled, and postponed events cannot receive new registrations.
- My Events is protected and separates upcoming and completed registrations for the current user.
- Loading, failure, retry, empty-result feedback, and responsive Bootstrap layouts.

## Structure

`src/pages/` contains routed screens, `src/components/` reusable UI, `src/store/` the Redux slices and persistence, and `src/services/ticketmaster.js` API requests and event mapping. Tests live next to the code they cover; `src/test/` holds setup and fixtures.

## Testing

Tests mock Ticketmaster requests and cover authentication, persistence, protected navigation, API states, user separation, duplicate prevention, and cancellation. Before submitting, check the layout on a phone-sized screen and desktop. With a valid key, register two accounts, search/filter events, open details, register, refresh, log out/in, and cancel from My Events.

## Configuration notes

Authentication and event registration are frontend simulations, as required by the assignment. Accounts, password hashes, sessions, and saved event snapshots are stored in this browser only. Registration does not book or buy a Ticketmaster ticket. Use demonstration credentials. Clearing site storage removes accounts and registrations; disabled storage prevents persistence.

Do not commit `.env` or your API key. The key is included in frontend requests, so environment variables keep it out of source control but do not conceal it from browser users. Consult the [Discovery API documentation](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/) for endpoints and available filters. Date-only events become completed after their venue-local date; otherwise the provided end or start timestamp is used.

## GitHub submission

The assignment requires meaningful development commits and submission of an instructor-accessible GitHub repository URL. Work on feature branches and commit features as they are developed, using descriptive messages such as `Add authentication pages` and `Implement event search`. PRs are encouraged and may be self-reviewed. Upload the source, README, package manifest/lockfile, and `.gitignore`; exclude dependencies, build output, and `.env`.
