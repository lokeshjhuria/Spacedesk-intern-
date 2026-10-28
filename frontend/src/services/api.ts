const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('odyssey_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });
  } catch (networkErr: any) {
    // Network error — backend is not running or unreachable
    const error: any = new Error(
      'Cannot connect to the game server. Please make sure the backend is running on port 5000.'
    );
    error.response = { data: { error: 'Network Error' }, status: 0 };
    throw error;
  }

  // Check if we got back HTML instead of JSON (happens when backend is down and proxy returns Vite error page)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      const error: any = new Error(
        'Game server not found (404). Please make sure the backend server is running.'
      );
      error.response = { data: { error: 'Server not found' }, status: 404 };
      throw error;
    }
    // Try parsing anyway — some responses might not set content-type
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('odyssey_token');
    }
    const error: any = new Error(data.error || data.message || `Request failed with status ${response.status}`);
    error.response = { data, status: response.status };
    throw error;
  }

  return data as T;
}

function buildQuery(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Player
  getProfile: () => request<any>('/player/profile'),
  updateProfile: (body: any) => request<any>('/player/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getProgress: () => request<any>('/player/progress'),
  getInventory: () => request<any>('/player/inventory'),

  // Missions
  listMissions: () => request<any>('/missions'),
  getMission: (id: string) => request<any>(`/missions/${id}`),
  startMission: (id: string) => request<any>(`/missions/${id}/start`, { method: 'POST' }),
  completeMission: (id: string, payload: any) => request<any>(`/missions/${id}/complete`, { method: 'POST', body: JSON.stringify(payload) }),

  // Ships
  listShips: () => request<any>('/ships'),
  unlockShip: (id: string) => request<any>(`/ships/${id}/unlock`, { method: 'POST' }),
  equipShip: (id: string) => request<any>(`/ships/${id}/equip`, { method: 'POST' }),

  // Upgrades
  listUpgrades: () => request<any>('/upgrades'),
  purchaseUpgrade: (upgradeId: string) => request<any>('/upgrades/purchase', { method: 'POST', body: JSON.stringify({ upgradeId }) }),
  equipUpgrade: (upgradeId: string) => request<any>('/upgrades/equip', { method: 'POST', body: JSON.stringify({ upgradeId }) }),

  // Wallet & Economy
  getWallet: () => request<any>('/wallet'),
  getTransactions: (params: any = {}) => {
    const q = buildQuery({ page: params.page || 1, limit: params.limit || 20, currency: params.currency });
    return request<any>(`/wallet/transactions${q}`);
  },
  getStreak: () => request<any>('/wallet/streak'),
  claimStreak: () => request<any>('/wallet/daily/claim', { method: 'POST' }),
  claimDaily: () => request<any>('/wallet/daily/claim', { method: 'POST' }),
  requestRewardedAd: (purpose: string) => request<any>('/wallet/ads/request', { method: 'POST', body: JSON.stringify({ purpose }) }),
  completeRewardedAd: (adSessionId: string, proofToken?: string) => request<any>('/wallet/ads/complete', { method: 'POST', body: JSON.stringify({ adSessionId, proofToken }) }),

  // Leaderboard
  getLeaderboard: (params: any = {}) => {
    const q = buildQuery({ page: params.page || 1, limit: params.limit || 20, sortBy: params.sortBy, timeframe: params.timeframe, missionId: params.missionId });
    return request<any>(`/leaderboard${q}`);
  },

  // Achievements
  listAchievements: () => request<any>('/achievements'),
  claimAchievement: (id: string) => request<any>(`/achievements/${id}/claim`, { method: 'POST' }),
  getDailyMissions: () => request<any>('/achievements/daily'),

  // Events
  listEvents: () => request<any>('/events'),
  createEvent: (body: any) => request<any>('/events', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAuditLogs: (category?: string) => request<any>(`/admin/audit-logs${category ? `?category=${category}` : ''}`),
  grantCurrency: (targetUserId: string, currency: string, amount: number) => request<any>('/admin/grant-currency', { method: 'POST', body: JSON.stringify({ targetUserId, currency, amount }) }),
  getAdminStats: () => request<any>('/admin/stats')
};
