import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import LoadState from '../components/LoadState';
import { fetchEvent } from '../store/eventsSlice';
import {
  addRegistration,
  cancelRegistration,
} from '../store/registrationsSlice';
import { canRegister, eventDate, isCompleted } from '../services/ticketmaster';

export default function EventDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [retry, setRetry] = useState(0);
  const [message, setMessage] = useState('');
  const {
    selected: event,
    detailStatus,
    detailError,
  } = useSelector((state) => state.events);
  const user = useSelector((state) => state.auth.user);
  const registered = useSelector(
    (state) =>
      !!state.registrations.byUser[user?.email]?.some((item) => item.id === id),
  );

  useEffect(() => {
    setMessage('');
    const request = dispatch(fetchEvent(id));
    return () => request.abort();
  }, [dispatch, id, retry]);

  useEffect(() => {
    setMessage('');
  }, [user?.email]);

  function toggleRegistration() {
    if (registered) {
      dispatch(cancelRegistration({ email: user.email, id }));
      setMessage('Your registration has been cancelled.');
    } else {
      dispatch(addRegistration({ email: user.email, event }));
      setMessage('You are registered. View this event in My Events.');
    }
  }

  return (
    <>
      <Link className="d-inline-block mb-3" to="/events">
        Back to events
      </Link>
      <LoadState
        status={detailStatus}
        error={detailError}
        retry={() => setRetry((value) => value + 1)}
      />
      {detailStatus === 'succeeded' && event?.id === id && (
        <article className="card card-body">
          <div className="row g-4">
            <div className="col-md-5">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.name}
                  className="img-fluid rounded w-100"
                />
              ) : (
                <p className="text-muted">No image available</p>
              )}
            </div>
            <div className="col-md-7">
              <span className="badge text-bg-secondary mb-2">
                {event.category}
              </span>
              <h1 className="h3">{event.name}</h1>
              <dl className="row mt-3">
                <dt className="col-sm-3">Date & time</dt>
                <dd className="col-sm-9">
                  {eventDate(event)}
                  {event.timezone && (
                    <span className="d-block small text-muted">
                      {event.timezone} (venue time)
                    </span>
                  )}
                </dd>
                <dt className="col-sm-3">Venue</dt>
                <dd className="col-sm-9">{event.venue}</dd>
                <dt className="col-sm-3">Location</dt>
                <dd className="col-sm-9">
                  {[event.address, event.location].filter(Boolean).join(', ') ||
                    'To be announced'}
                </dd>
                {event.genre && event.genre !== 'Undefined' && (
                  <>
                    <dt className="col-sm-3">Type</dt>
                    <dd className="col-sm-9">{event.genre}</dd>
                  </>
                )}
                {event.status && (
                  <>
                    <dt className="col-sm-3">Status</dt>
                    <dd className="col-sm-9 text-capitalize">{event.status}</dd>
                  </>
                )}
                {event.price && (
                  <>
                    <dt className="col-sm-3">Price range</dt>
                    <dd className="col-sm-9">
                      {event.price.currency} {event.price.min}–{event.price.max}
                    </dd>
                  </>
                )}
              </dl>
              {event.info && <p>{event.info}</p>}
              {message && (
                <div className="alert alert-success" role="status">
                  {message}
                </div>
              )}
              {registered && (
                <p className="text-success">
                  You are registered for this event.
                </p>
              )}
              <div className="d-flex gap-2 flex-wrap">
                {user ? (
                  <button
                    className={`btn ${registered ? 'btn-outline-danger' : 'btn-primary'}`}
                    disabled={
                      registered ? isCompleted(event) : !canRegister(event)
                    }
                    onClick={toggleRegistration}
                  >
                    {registered ? 'Cancel registration' : 'Register for event'}
                  </button>
                ) : (
                  <Link
                    className="btn btn-primary"
                    to="/login"
                    state={{ from: `/events/${id}` }}
                  >
                    Login to register
                  </Link>
                )}
                {event.url && (
                  <a
                    className="btn btn-outline-secondary"
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ticketmaster page
                  </a>
                )}
              </div>
              {!canRegister(event) && (
                <p className="small text-muted mt-2">
                  Registration is closed for this event.
                </p>
              )}
            </div>
          </div>
        </article>
      )}
    </>
  );
}
