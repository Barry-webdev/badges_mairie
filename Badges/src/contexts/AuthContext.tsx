import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('gc_pita_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('gc_pita_token');
      if (!token) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const user = await authService.getMe();
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('gc_pita_token');
        localStorage.removeItem('gc_pita_user');
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login({ email, password });
    localStorage.setItem('gc_pita_token', token);
    localStorage.setItem('gc_pita_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('gc_pita_token');
    localStorage.removeItem('gc_pita_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
