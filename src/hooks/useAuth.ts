import { useState, useEffect } from 'react';
import { getUserFromCookie } from '../lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'ENTERPRISE' | 'ADM' | 'USER';
  enterpriseId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Tentar ler do cookie primeiro
      const userFromCookie = getUserFromCookie();
      if (userFromCookie) {
        setAuthState({
          user: userFromCookie,
          token,
          loading: false
        });
        return;
      }
      
      // Fallback para localStorage se cookie não existir
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            token,
            loading: false
          });
          return;
        } catch {}
      }
    }
    
    setAuthState(prev => ({ ...prev, loading: false }));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.token,
        loading: false
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.token,
        loading: false
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setAuthState({
      user: null,
      token: null,
      loading: false
    });
  };

  return {
    ...authState,
    login,
    register,
    logout,
    isAuthenticated: !!authState.user
  };
};