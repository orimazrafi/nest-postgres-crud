import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth';
import { ApiError } from '../api/client';
import { AuthFooterLink, AuthLayout } from '../components/AuthLayout';

/** Registration form; redirects to login after a successful sign-up. */
export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Submits sign-up credentials to the API. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        email,
        name: name.trim() || undefined,
        password,
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Account created. Please log in.' },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up to access your profile."
      footer={
        <AuthFooterLink
          text="Already have an account?"
          linkText="Log in"
          to="/login"
        />
      }
    >
      <form className="form" onSubmit={handleSubmit}>
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
          Name
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <p className="hint">
          At least 8 characters with one letter and one number.
        </p>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  );
}
