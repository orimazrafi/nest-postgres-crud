import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { logout } from '../api/auth';
import { ApiError } from '../api/client';
import type { User } from '../types/user';

type WelcomeContext = {
  user: User;
};

/** Post-login page showing the authenticated user and a logout action. */
export function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useOutletContext<WelcomeContext>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Ends the session and returns to the login page. */
  async function handleLogout() {
    setError('');
    setLoading(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <header className="card-header">
          <h1>Welcome{user.name ? `, ${user.name}` : ''}</h1>
          <p className="muted">You are logged in.</p>
        </header>
        <dl className="profile">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{user.id}</dd>
          </div>
        </dl>
        {error ? <p className="error">{error}</p> : null}
        <button type="button" onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Log out'}
        </button>
      </section>
    </main>
  );
}
