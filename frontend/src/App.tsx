import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AudioProvider } from './context/AudioContext'
import { ToastProvider } from './context/ToastContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MissionsPage from './pages/MissionsPage'
import GamePage from './pages/GamePage'
import HangarPage from './pages/HangarPage'
import UpgradesPage from './pages/UpgradesPage'
import WalletPage from './pages/WalletPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AchievementsPage from './pages/AchievementsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Protected */}
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
    <Route path="/game/:missionId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
    <Route path="/hangar" element={<ProtectedRoute><HangarPage /></ProtectedRoute>} />
    <Route path="/upgrades" element={<ProtectedRoute><UpgradesPage /></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
    <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
    <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App: React.FC = () => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <AudioProvider>
          <AppRoutes />
        </AudioProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
)

export default App
