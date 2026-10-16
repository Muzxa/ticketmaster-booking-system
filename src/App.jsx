import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { logout } from './store/authSlice';
import Auth from './pages/Auth';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
}

export default function App() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  return (
    <>
      <header className="border-bottom bg-white">
        <nav className="navbar container gap-2" aria-label="Main navigation">
          <Link className="navbar-brand" to="/events">
            Event Management
          </Link>
          <div className="d-flex align-items-center flex-wrap gap-3">
            <NavLink className="nav-link" to="/events">
              Events
            </NavLink>
            <NavLink className="nav-link" to="/my-events">
              My Events
            </NavLink>
            {user ? (
              <>
                <span className="small text-muted">{user.name}</span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-primary btn-sm" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <>
                <h1 className="h3">Page not found</h1>
                <Link to="/events">Back to events</Link>
              </>
            }
          />
        </Routes>
      </main>
    </>
  );
}
