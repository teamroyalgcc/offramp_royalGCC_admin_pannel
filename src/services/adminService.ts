import api from '@/lib/axios';

export const adminService = {
  // --- AUTH ---
  login: async (payload: any) => {
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
  approveDeposit: async (txHash: string) => {
    const response = await api.post(`/api/admin/deposits/${txHash}/approve`);
    return response.data;
  },
  manualCredit: async (payload: { userId: string; amount: number; txHash: string }) => {
    const response = await api.post('/api/admin/manual-credit', payload);
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
  getLiveRate: async () => {
    const response = await api.get('/api/exchange/rate');
    return response.data; // { rate: number }
  },
  updateExchangeSpread: async (spreadPercent: number) => {
    const response = await api.post('/api/admin/settings/rate', { spreadPercent });
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
  addAdmin: async (payload: any) => {
    const response = await api.post('/api/admin/add-admin', payload);
    return response.data;
  },
  updateAdmin: async (id: string, payload: any) => {
    const response = await api.post(`/api/admin/${id}/update`, payload);
    return response.data;
  },
  deleteAdmin: async (id: string) => {
    const response = await api.delete(`/api/admin/${id}`);
    return response.data;
  }
};
