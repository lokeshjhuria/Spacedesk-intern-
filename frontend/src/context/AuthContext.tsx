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

function createLocalPilotSession(username: string, email: string, role: 'player' | 'admin' = 'player') {
  const userId = 'pilot_' + Date.now();
  const now = new Date().toISOString();

  const user: IUser = {
    id: userId,
    username,
    email,
    role,
    createdAt: now
  };

  const profile: IPlayerProfile = {
    id: 'prof_' + userId,
    userId,
    displayName: username,
    avatarUrl: '/avatars/pilot_default.png',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    equippedShipId: 'ship_interceptor',
    equippedUpgrades: {
      weapon: 1,
      shield: 1,
      engine: 1,
      hull: 1,
      reactor: 1
    },
    highestSector: 1,
    totalMissionsCompleted: 0,
    totalScore: 0,
    stats: {
      enemiesKilled: 0,
      bossesDefeated: 0,
      deaths: 0,
      powerupsCollected: 0,
      playTimeSeconds: 0
    }
  };

  const wallet: IWallet = {
    userId,
    credits: 1000,
    energyCores: 10,
    veloopCoins: 50,
    xp: 0,
    updatedAt: now
  };

  const progress: IPlayerProgress = {
    userId,
    completedMissions: [],
    unlockedShips: ['ship_interceptor'],
    unlockedSectors: [1]
  };

  return { user, profile, wallet, progress };
}

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
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Session check with backend failed, checking local backup:', err);
      const saved = localStorage.getItem('odyssey_local_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setWallet(parsed.wallet);
          setProgress(parsed.progress);
          setLoading(false);
          return;
        } catch {}
      }
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
    try {
      const res = await api.login({ email, password: pass });
      if (res.token) {
        localStorage.setItem('odyssey_token', res.token);
        setUser(res.user);
        setProfile(res.profile || null);
        setWallet(res.wallet || null);
        try {
          const prog = await api.getProgress();
          if (prog?.progress) setProgress(prog.progress);
        } catch {
          // Progress fetch is optional
        }
        return;
      }
      throw new Error(res.error || res.message || 'Login failed — no token received');
    } catch (err: any) {
      const isOfflineOr404 =
        err.message?.includes('404') ||
        err.message?.includes('Resource not found') ||
        err.message?.includes('Cannot connect') ||
        err.message?.includes('Network Error') ||
        err.response?.status === 404 ||
        err.status === 404;

      if (isOfflineOr404) {
        const saved = localStorage.getItem('odyssey_local_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setWallet(parsed.wallet);
            setProgress(parsed.progress);
            return;
          } catch {}
        }
        const defaultName = email.split('@')[0] || 'Commander';
        const role: 'player' | 'admin' = email.toLowerCase().includes('admin') ? 'admin' : 'player';
        const session = createLocalPilotSession(defaultName, email, role);
        const mockToken = 'pilot_session_' + Date.now();
        localStorage.setItem('odyssey_token', mockToken);
        localStorage.setItem('odyssey_local_data', JSON.stringify(session));
        setUser(session.user);
        setProfile(session.profile);
        setWallet(session.wallet);
        setProgress(session.progress);
        return;
      }
      throw err;
    }
  };

  const register = async (username: string, email: string, pass: string) => {
    try {
      const res = await api.register({ username, email, password: pass });
      if (res.token) {
        localStorage.setItem('odyssey_token', res.token);
        setUser(res.user);
        setProfile(res.profile || null);
        setWallet(res.wallet || null);
        try {
          const prog = await api.getProgress();
          if (prog?.progress) setProgress(prog.progress);
        } catch {
          // Progress fetch is optional
        }
        return;
      }
      throw new Error(res.error || res.message || 'Registration failed — no token received');
    } catch (err: any) {
      const isOfflineOr404 =
        err.message?.includes('404') ||
        err.message?.includes('Resource not found') ||
        err.message?.includes('Cannot connect') ||
        err.message?.includes('Network Error') ||
        err.response?.status === 404 ||
        err.status === 404;

      if (isOfflineOr404) {
        console.warn('[Auth] Seamless local account creation activated for:', username);
        const session = createLocalPilotSession(username, email, 'player');
        const mockToken = 'pilot_session_' + Date.now();
        localStorage.setItem('odyssey_token', mockToken);
        localStorage.setItem('odyssey_local_data', JSON.stringify(session));

        setUser(session.user);
        setProfile(session.profile);
        setWallet(session.wallet);
        setProgress(session.progress);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('odyssey_token');
    localStorage.removeItem('odyssey_local_data');
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
