import { apiRequest } from './client';
import type { User } from '../types/user';

type SignUpPayload = {
  email: string;
  name?: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

/** Registers a new user account. */
export function signUp(payload: SignUpPayload): Promise<User> {
  return apiRequest<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Logs in and stores the session cookie from the response. */
export function login(payload: LoginPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Returns the current user when a valid session cookie is present. */
export function getMe(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

/** Clears the server session and cookie. */
export function logout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}
