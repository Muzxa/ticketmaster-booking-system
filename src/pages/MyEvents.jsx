import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { isCompleted } from '../services/ticketmaster';
import { cancelRegistration } from '../store/registrationsSlice';

export default function MyEvents() {
  const user = useSelector((state) => state.auth.user);
  const events = useSelector(
    (state) => state.registrations.byUser[user?.email],
  );
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const groups = [
    { title: 'Upcoming', completed: false },
    { title: 'Completed', completed: true },
  ];

  function cancel(id) {
    dispatch(cancelRegistration({ email: user.email, id }));
    setMessage('Your registration has been cancelled.');
  }

  return (
    <>
      <h1 className="h3">My Events</h1>
      <p className="text-muted">Events registered by {user?.name}.</p>
      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}
      {!events?.length ? (
        <div className="alert alert-secondary">
          You have no registered events. <Link to="/events">Browse events</Link>
        </div>
      ) : (
        groups.map(({ title, completed }) => {
          const list = events.filter(
            (event) => isCompleted(event) === completed,
          );
          return (
            <section className="mb-4" key={title}>
              <h2 className="h5">
                {title} ({list.length})
              </h2>
              {list.length ? (
                <div className="row g-3">
                  {list.map((event) => (
                    <div className="col-sm-6 col-lg-4" key={event.id}>
                      <EventCard event={event}>
                        {!completed && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => cancel(event.id)}
                          >
                            Cancel registration
                          </button>
                        )}
                      </EventCard>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">
                  No {title.toLowerCase()} events.
                </p>
              )}
            </section>
          );
        })
      )}
    </>
  );
}
