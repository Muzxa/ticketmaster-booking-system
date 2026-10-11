import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authenticate, clearAuthError } from '../store/authSlice';

export default function Auth({ register = false }) {
  const { user, status, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/events';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, register]);

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = await dispatch(authenticate({ ...values, register }));
    if (authenticate.fulfilled.match(result))
      navigate(destination, { replace: true });
  }

  if (user) return <Navigate to={destination} replace />;
  return (
    <section className="auth-form mx-auto">
      <h1 className="h3 mb-3">{register ? 'Create an account' : 'Login'}</h1>
      <div className="card card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          {register && (
            <div className="mb-3">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                className="form-control"
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
              />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-control"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              minLength={6}
              required
              aria-describedby="password-help"
            />
            <div className="form-text" id="password-help">
              At least 6 characters.
            </div>
          </div>
          <button className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Please wait...'
              : register
                ? 'Register'
                : 'Login'}
          </button>
        </form>
      </div>
      <p className="mt-3 small">
        {register ? 'Already have an account? ' : 'No account yet? '}
        <Link to={register ? '/login' : '/register'} state={location.state}>
          {register ? 'Login' : 'Register'}
        </Link>
      </p>
    </section>
  );
}
