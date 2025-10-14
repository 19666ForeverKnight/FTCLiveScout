'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Models } from 'appwrite';
import { getCurrentUser, login, logout, signup, LoginData, SignupData } from '@/lib/auth';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  initialCheckDone: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check user session on initial mount (silently in background)
  useEffect(() => {
    checkUserSilently();
  }, []);

  async function checkUserSilently() {
    if (initialCheckDone) return;

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setInitialCheckDone(true);
    }
  }

  async function checkUser() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }

  async function handleLogin(data: LoginData) {
    await login(data);
    await checkUser();
  }

  async function handleSignup(data: SignupData) {
    await signup(data);
    await checkUser();
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setInitialCheckDone(true);
  }

  const value = {
    user,
    loading,
    initialCheckDone,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    checkUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
