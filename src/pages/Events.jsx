import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import LoadState from '../components/LoadState';
import { fetchEvents } from '../store/eventsSlice';

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [retry, setRetry] = useState(0);
  const dispatch = useDispatch();
  const { items, status, error, totalPages, total } = useSelector(
    (state) => state.events,
  );
  const page = Math.max(0, Math.min(82, Number(params.get('page')) || 0));

  useEffect(() => {
    const request = dispatch(
      fetchEvents({ ...Object.fromEntries(params), page }),
    );
    return () => request.abort();
  }, [dispatch, params, page, retry]);

  function search(event) {
    event.preventDefault();
    const filters = Object.fromEntries(new FormData(event.currentTarget));
    setParams(
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim()),
      ),
    );
    setRetry((value) => value + 1);
  }

  function changePage(next) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('page', next);
    setParams(nextParams);
  }

  return (
    <>
      <h1 className="h3">Upcoming events</h1>
      <p className="text-muted">
        Find an event and register to keep it in My Events.
      </p>
      <form
        className="card card-body mb-4"
        onSubmit={search}
        key={params.toString()}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="keyword">
              Search
            </label>
            <input
              id="keyword"
              name="keyword"
              className="form-control"
              placeholder="Event or artist name"
              defaultValue={params.get('keyword') || ''}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="classificationName"
              className="form-select"
              defaultValue={params.get('classificationName') || ''}
            >
              <option value="">All categories</option>
              {[
                'Music',
                'Sports',
                'Arts & Theatre',
                'Film',
                'Miscellaneous',
              ].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              className="form-control"
              placeholder="e.g. London"
              defaultValue={params.get('city') || ''}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="country">
              Country
            </label>
            <select
              id="country"
              name="countryCode"
              className="form-select"
              defaultValue={params.get('countryCode') || ''}
            >
              <option value="">All countries</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="date">
              From date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="form-control"
              min={new Date().toISOString().slice(0, 10)}
              defaultValue={params.get('date') || ''}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              className="form-select"
              defaultValue={params.get('sort') || 'date,asc'}
            >
              <option value="date,asc">Soonest first</option>
              <option value="name,asc">Name (A–Z)</option>
              <option value="relevance,desc">Relevance</option>
            </select>
          </div>
        </div>
        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" disabled={status === 'loading'}>
            Search events
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => {
              setParams({});
              setRetry((value) => value + 1);
            }}
          >
            Reset
          </button>
        </div>
      </form>
      <LoadState
        status={status}
        error={error}
        retry={() => setRetry((value) => value + 1)}
      />
      {status === 'succeeded' && (
        <>
          <p className="small text-muted" role="status">
            {total} events found
            {totalPages > 0 && ` · page ${page + 1} of ${totalPages}`}
          </p>
          {items.length ? (
            <div className="row g-3">
              {items.map((event) => (
                <div className="col-sm-6 col-lg-4" key={event.id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-secondary">
              No events found. Try another search or reset the filters.
            </div>
          )}
          {totalPages > 1 && (
            <nav
              className="d-flex justify-content-center gap-2 mt-4"
              aria-label="Event pages"
            >
              <button
                className="btn btn-outline-secondary"
                disabled={page === 0}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => changePage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
