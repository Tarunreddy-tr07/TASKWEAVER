import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR' };

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_USER': return {
      user: action.payload.user,
      token: action.payload.token,
      isAuthenticated: true,
      isLoading: false,
    };
    case 'CLEAR': return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default: return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('taskweaver_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('taskweaver_token');
    if (token) {
      authApi.me()
        .then((res) => dispatch({ type: 'SET_USER', payload: { user: res.data, token } }))
        .catch(() => {
          localStorage.removeItem('taskweaver_token');
          dispatch({ type: 'CLEAR' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authApi.login(email, password);
      const { access_token, user } = res.data;
      localStorage.setItem('taskweaver_token', access_token);
      dispatch({ type: 'SET_USER', payload: { user, token: access_token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('taskweaver_token');
    dispatch({ type: 'CLEAR' });
    window.location.href = '/login';
  };

  const register = async (data: { name: string; email: string; password: string; role: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authApi.register(data);
      const { access_token, user } = res.data;
      localStorage.setItem('taskweaver_token', access_token);
      dispatch({ type: 'SET_USER', payload: { user, token: access_token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
