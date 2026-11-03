import api from '@/lib/axios';

export interface AppRelease {
  latestVersion: string | null;
  minVersion: string | null;
  apkUrl: string | null;
  releaseNotes: string | null;
}

export interface AdminPayload {
  username?: string;
  password?: string;
  role?: string;
}

export const adminService = {
  // --- AUTH ---
  login: async (payload: { username: string; password: string }) => {
    const response = await api.post('/api/admin/login', payload);
    return response.data;
  },

  // --- DASHBOARD ---
  getDashboardMetrics: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  // --- KYC ---
  listKyc: async () => {
    const response = await api.get('/api/admin/kyc');
    return response.data;
  },
  approveKyc: async (id: string) => {
    const response = await api.post(`/api/admin/kyc/${id}/approve`);
    return response.data;
  },
  rejectKyc: async (id: string, reason: string) => {
    const response = await api.post(`/api/admin/kyc/${id}/reject`, { reason });
    return response.data;
  },

  // --- DEPOSITS ---
  listDeposits: async () => {
    const response = await api.get('/api/admin/deposits');
    return response.data;
  },
  /** Items needing a human, each with a plain-language explanation and an optional action. */
  getDepositHealth: async () => {
    const response = await api.get('/api/admin/deposits/health');
    return response.data;
  },
  runDepositCheck: async () => {
    const response = await api.post('/api/admin/deposits/audit');
    return response.data;
  },
  /** Transfers to treasury with energy costs, plus Netts / operating wallet balances. */
  listSweeps: async () => {
    const response = await api.get('/api/admin/sweeps');
    return response.data;
  },
  sweepNow: async (id: string) => {
    const response = await api.post(`/api/admin/sweeps/${id}/now`);
    return response.data;
  },
  retrySweep: async (id: string) => {
    const response = await api.post(`/api/admin/sweeps/${id}/retry`);
    return response.data;
  },
  /** Runs the action the backend attached to a health item (retry, credit, check again). */
  runAction: async (action: { method: string; path: string }) => {
    const response = await api.request({ method: action.method, url: action.path });
    return response.data;
  },

  // --- USDT WITHDRAWALS (paid by hand from the treasury wallet) ---
  listWithdrawals: async () => {
    const response = await api.get('/api/admin/withdrawals');
    return response.data;
  },
  markWithdrawalSent: async (id: string, txHash: string) => {
    const response = await api.post(`/api/admin/withdrawals/${id}/approve`, { tx_hash: txHash });
    return response.data;
  },
  rejectWithdrawal: async (id: string, reason: string) => {
    const response = await api.post(`/api/admin/withdrawals/${id}/reject`, { reason });
    return response.data;
  },

  // --- ORDERS ---
  listOrders: async () => {
    const response = await api.get('/api/admin/orders');
    return response.data;
  },
  updateOrderStatus: async (id: string, payload: { status: string; note: string }) => {
    const response = await api.post(`/api/admin/orders/${id}/status`, payload);
    return response.data;
  },

  // --- USERS ---
  listUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
  freezeUser: async (id: string, frozen: boolean) => {
    const response = await api.post(`/api/admin/users/${id}/freeze`, { frozen });
    return response.data;
  },

  // --- AUDIT LOGS ---
  listAuditLogs: async () => {
    const response = await api.get('/api/admin/audit');
    return response.data;
  },

  // --- CONFIG / RATES ---
  // { rate, mode: 'manual' | null, pausedReason, manualRate, manualRateExpiresAt,
  //   updatedAt, minSellUsdt, minWithdrawalUsdt, withdrawalFeeUsdt }
  getLiveRate: async () => {
    const response = await api.get('/api/exchange/rate');
    return response.data;
  },
  // number (50..500): the rate users get, used as-is until changed or cleared; null: clear it, the
  // backend then falls back to the live market minus the spread.
  setManualRate: async (manualRate: number | null) => {
    const response = await api.post('/api/admin/settings/rate', { manualRate });
    return response.data;
  },

  // --- APP RELEASE (mobile app update prompt) ---
  // Public endpoint; axios baseURL has no /api prefix.
  getAppVersion: async (): Promise<AppRelease> => {
    const response = await api.get('/api/app/version');
    return response.data;
  },
  updateAppRelease: async (payload: Partial<AppRelease>) => {
    const response = await api.post('/api/admin/settings/app-release', payload);
    return response.data;
  },

  // --- ADMIN PROFILE & ROLE MANAGEMENT ---
  getMe: async () => {
    const response = await api.get('/api/admin/me');
    return response.data;
  },
  updateCredentials: async (payload: { username?: string; password?: string }) => {
    const response = await api.post('/api/admin/update-credentials', payload);
    return response.data;
  },
  listAdmins: async () => {
    const response = await api.get('/api/admin/list');
    return response.data;
  },
  addAdmin: async (payload: AdminPayload) => {
    const response = await api.post('/api/admin/add-admin', payload);
    return response.data;
  },
  updateAdmin: async (id: string, payload: AdminPayload) => {
    const response = await api.post(`/api/admin/${id}/update`, payload);
    return response.data;
  },
  deleteAdmin: async (id: string) => {
    const response = await api.delete(`/api/admin/${id}`);
    return response.data;
  }
};
