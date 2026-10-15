import React from 'react';

export default function LoadState({ status, error, retry }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status">
        <span
          className="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        />
        Loading events...
      </p>
    );
  }
  if (status === 'failed') {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Unable to load events. Check your connection.'}
        <button className="btn btn-outline-danger btn-sm ms-3" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  return null;
}
