import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { IUser, IPlayerProfile, IWallet, IPlayerProgress } from '../types/shared';

interface AuthContextType {
  user: IUser | null;
  profile: IPlayerProfile | null;
  wallet: IWallet | null;
  progress: IPlayerProgress | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (user: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  wallet: null,
  progress: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUserData: async () => {},
  refreshWallet: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<IPlayerProfile | null>(null);
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [progress, setProgress] = useState<IPlayerProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('odyssey_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setWallet(data.wallet);
        setProgress(data.progress);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('odyssey_token');
      setUser(null);
      setProfile(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.token) {
      localStorage.setItem('odyssey_token', res.token);
      setUser(res.user);
      setProfile(res.profile || null);
      setWallet(res.wallet || null);
      // Fetch progress separately — don't fail login if this errors
      try {
        const prog = await api.getProgress();
        if (prog?.progress) setProgress(prog.progress);
      } catch {
        // Progress fetch is optional — login already succeeded
      }
    } else {
      throw new Error(res.error || res.message || 'Login failed — no token received');
    }
  };

  const register = async (username: string, email: string, pass: string) => {
    const res = await api.register({ username, email, password: pass });
    if (res.token) {
      localStorage.setItem('odyssey_token', res.token);
      setUser(res.user);
      setProfile(res.profile || null);
      setWallet(res.wallet || null);
      // Fetch progress separately — don't fail registration if this errors
      try {
        const prog = await api.getProgress();
        if (prog?.progress) setProgress(prog.progress);
      } catch {
        // Progress fetch is optional — registration already succeeded
      }
    } else {
      throw new Error(res.error || res.message || 'Registration failed — no token received');
    }
  };

  const logout = () => {
    localStorage.removeItem('odyssey_token');
    setUser(null);
    setProfile(null);
    setWallet(null);
    setProgress(null);
  };

  const refreshUserData = async () => {
    await fetchCurrentUser();
  };

  const refreshWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res.success && res.wallet) {
        setWallet(res.wallet);
      }
    } catch (err) {
      console.error('Failed to refresh wallet:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        wallet,
        progress,
        loading,
        login,
        register,
        logout,
        refreshUserData,
        refreshWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
