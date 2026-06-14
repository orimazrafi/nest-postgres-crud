import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { ApiError } from '../api/client';
import { AuthFooterLink, AuthLayout } from '../components/AuthLayout';

type LocationState = {
  message?: string;
};

/** Login form; redirects to the welcome page after success. */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as LocationState | null)?.message;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Authenticates the user and navigates to the welcome page. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/welcome', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in with your email and password."
      footer={
        <AuthFooterLink
          text="Need an account?"
          linkText="Sign up"
          to="/signup"
        />
      }
    >
      <form className="form" onSubmit={handleSubmit}>
        {notice ? <p className="success">{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
