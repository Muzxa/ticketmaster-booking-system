import React from 'react';
import { Link } from 'react-router-dom';
import { eventDate } from '../services/ticketmaster';

export default function EventCard({ event, children }) {
  return (
    <article className="card h-100">
      {event.image ? (
        <img
          src={event.image}
          alt={event.name}
          className="card-img-top event-image"
          loading="lazy"
        />
      ) : (
        <div className="event-image bg-secondary-subtle d-flex align-items-center justify-content-center text-muted">
          No image available
        </div>
      )}
      <div className="card-body d-flex flex-column align-items-start">
        <span className="badge text-bg-secondary mb-2">{event.category}</span>
        <h3 className="h6">{event.name}</h3>
        <p className="small mb-2">{eventDate(event)}</p>
        <p className="small text-muted">
          {event.venue}
          <br />
          {event.location}
        </p>
        <div className="mt-auto d-flex gap-2 flex-wrap">
          <Link
            className="btn btn-outline-primary btn-sm"
            to={`/events/${event.id}`}
          >
            View details
          </Link>
          {children}
        </div>
      </div>
    </article>
  );
}
