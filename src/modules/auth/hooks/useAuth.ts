import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  modules?: string[];   
  phone?: string;
  bio?: string;
  company?: string;
  position?: string;
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

  //Carrega token + user no carregamento
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setAuthState({
        user: JSON.parse(userData),
        token,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  //LOGIN
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

      //Salva token
      localStorage.setItem('token', data.token);

      //salva os dados do usuário, incluindo modules
      localStorage.setItem('user', JSON.stringify(data.user));

      //salva email para consultas
      localStorage.setItem('userEmail', data.user.email);

      setAuthState({
        user: data.user,
        token: data.token,
        loading: false
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  //REGISTRO
  const register = async (name: string, email: string, password: string, securityWord: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, securityWord })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      localStorage.setItem('userEmail', data.user.email);

      setAuthState({
        user: data.user,
        token: data.token,
        loading: false
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  //LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
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
