import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { getMe } from '../api/auth';
import type { User } from '../types/user';

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' };

/** Blocks child routes until the session cookie is validated via /auth/me. */
export function ProtectedRoute() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    getMe()
      .then((user) => {
        if (active) {
          setState({ status: 'authenticated', user });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          setState({ status: 'unauthenticated' });
          return;
        }
        setState({ status: 'unauthenticated' });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <p className="muted">Checking session...</p>;
  }

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user: state.user }} />;
}
