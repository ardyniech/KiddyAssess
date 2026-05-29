import { useAuth } from '../context/AuthContext';

export function useAppAuth() {
  const { user, loading } = useAuth();
  return { user, authLoading: loading };
}
