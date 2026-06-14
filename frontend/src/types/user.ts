/** Authenticated user returned by the API (password excluded). */
export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};
