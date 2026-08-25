/**
 * Khanan Suraksha API Client
 * Centralized REST client connecting the React frontend to the NestJS backend (http://localhost:4000/api/v1).
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Token storage helpers
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('ks_access_token'),
  getRefreshToken: () => localStorage.getItem('ks_refresh_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('ks_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setTokens: (access, refresh, user) => {
    if (access) localStorage.setItem('ks_access_token', access);
    if (refresh) localStorage.setItem('ks_refresh_token', refresh);
    if (user) localStorage.setItem('ks_user', JSON.stringify(user));
  },
  clearTokens: () => {
    localStorage.removeItem('ks_access_token');
    localStorage.removeItem('ks_refresh_token');
    localStorage.removeItem('ks_user');
  },
};

/**
 * Core fetch wrapper with auto-bearer auth and 401 refresh retry logic
 */
async function request(endpoint, options = {}, isRetry = false) {
  const token = tokenStorage.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Handle 401 with Token Refresh
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            tokenStorage.setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
            return request(endpoint, options, true); // Retry original request
          }
        } catch {
          tokenStorage.clearTokens();
        }
      }
      tokenStorage.clearTokens();
    }

    if (!response.ok) {
      let errBody;
      try {
        errBody = await response.json();
      } catch {
        errBody = { message: response.statusText };
      }
      throw new ApiError(errBody.message || `HTTP ${response.status}`, response.status, errBody);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error connecting to governance server', 0, null);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT SERVICE METHODS
// ═══════════════════════════════════════════════════════════════════════════

export const api = {
  // 1. Auth & Session
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.accessToken) {
        tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
      }
      return res.data;
    },
    logout: async () => {
      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          await request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
        }
      } catch {
        // ignore logout failure
      } finally {
        tokenStorage.clearTokens();
      }
    },
  },

  // 2. Mines & Organizations
  mines: {
    list: async () => {
      const res = await request('/mines');
      return res.data || [];
    },
    getNearby: async (latitude, longitude, radiusKm = 50) => {
      const res = await request(`/mines/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`);
      return res;
    },
    getLocationContext: async (mineId, latitude, longitude) => {
      const res = await request(`/mines/${mineId}/location-context?latitude=${latitude}&longitude=${longitude}`);
      return res.data;
    },
  },

  // 3. Dashboard Aggregations
  dashboard: {
    getMineOverview: async (mineId) => {
      const res = await request(`/dashboard/mine/${mineId}/overview`);
      return res.data;
    },
    getCompanyOverview: async (companyId) => {
      const res = await request(`/dashboard/company/${companyId}/overview`);
      return res.data;
    },
    getRegulatorOverview: async () => {
      const res = await request('/dashboard/regulator/overview');
      return res.data;
    },
  },

  // 4. Compliance Register
  compliance: {
    getRequirements: async () => {
      const res = await request('/compliance/requirements');
      return res.data || [];
    },
    getMineRecords: async (mineId) => {
      const res = await request(`/mines/${mineId}/compliance/records`);
      return res.data || [];
    },
  },

  // 5. Inspections & Observations
  inspections: {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/inspections${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },
    getTemplates: async () => {
      const res = await request('/inspections/templates');
      return res.data || [];
    },
    createObservation: async (inspectionId, data) => {
      const res = await request(`/inspections/${inspectionId}/observations`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },
  },

  // 6. Violations & CAPA
  violations: {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/violations${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },
  },
  correctiveActions: {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/corrective-actions${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },
    create: async (violationId, data) => {
      const res = await request(`/violations/${violationId}/corrective-actions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },
    close: async (id, closureNote) => {
      const res = await request(`/corrective-actions/${id}/close`, {
        method: 'POST',
        body: JSON.stringify({ closureNote }),
      });
      return res.data;
    },
  },

  // 7. Contractors & Workers
  contractors: {
    list: async () => {
      const res = await request('/contractors');
      return res.data || [];
    },
    getContracts: async () => {
      const res = await request('/contractor-contracts');
      return res.data || [];
    },
    getWorkers: async () => {
      const res = await request('/workers');
      return res.data || [];
    },
  },

  // 8. Attendance
  attendance: {
    getSummary: async (mineId, date) => {
      const qs = new URLSearchParams({
        ...(mineId ? { mineId } : {}),
        ...(date ? { date } : {}),
      }).toString();
      const res = await request(`/attendance/summary${qs ? `?${qs}` : ''}`);
      return res.data;
    },
  },

  // 9. Grievances
  grievances: {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/grievances${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },
    resolve: async (id, resolutionNote) => {
      const res = await request(`/grievances/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNote }),
      });
      return res.data;
    },
  },

  // 10. Notifications
  notifications: {
    list: async () => {
      const res = await request('/notifications');
      return res.data || [];
    },
    getUnreadCount: async () => {
      const res = await request('/notifications/unread-count');
      return res.data?.unreadCount || 0;
    },
    markAllAsRead: async () => {
      return await request('/notifications/read-all', { method: 'POST' });
    },
  },

  // 11. AI Risk Scoring & Anomalies
  riskScores: {
    getMineScore: async (mineId) => {
      const res = await request(`/mines/${mineId}/risk-score`);
      return res.data;
    },
    getAnomalies: async (mineId) => {
      const qs = mineId ? `?mineId=${mineId}` : '';
      const res = await request(`/anomalies${qs}`);
      return res.data || [];
    },
  },

  // 12. Practical GIS & OCR Digitization
  ocr: {
    listJobs: async () => {
      const res = await request('/ocr/jobs');
      return res.data || [];
    },
    reviewJob: async (jobId, correctedFields) => {
      const res = await request(`/ocr/jobs/${jobId}/review`, {
        method: 'POST',
        body: JSON.stringify({ correctedFields }),
      });
      return res.data;
    },
  },

  // 13. Hash-Chained Tamper-Evident Audit Trail
  audit: {
    getLogs: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/audit-logs${qs ? `?${qs}` : ''}`);
      return res;
    },
    verifyChain: async (fromSequence = 1, toSequence) => {
      const qs = new URLSearchParams({
        fromSequence,
        ...(toSequence ? { toSequence } : {}),
      }).toString();
      const res = await request(`/audit-logs/verify?${qs}`);
      return res.data;
    },
    getEntityHistory: async (type, id) => {
      const res = await request(`/audit-logs/entity/${type}/${id}`);
      return res.data;
    },
  },

  // 14. Conversational Governance Assistant
  assistant: {
    query: async (question, language = 'en', mineId) => {
      const res = await request('/assistant/query', {
        method: 'POST',
        body: JSON.stringify({
          question,
          language,
          ...(mineId ? { mineId } : {}),
        }),
      });
      return res.data;
    },
    getCapabilities: async () => {
      const res = await request('/assistant/capabilities');
      return res.data;
    },
  },

  // 15. Reports & Exports
  reports: {
    getComplianceGrid: async (mineId) => {
      const qs = mineId ? `?mineId=${mineId}` : '';
      const res = await request(`/reports/compliance${qs}`);
      return res;
    },
    getExportUrl: (format = 'csv', mineId, companyId) => {
      const params = new URLSearchParams({
        format,
        ...(mineId ? { mineId } : {}),
        ...(companyId ? { companyId } : {}),
      });
      return `${API_BASE}/reports/statutory/export?${params.toString()}`;
    },
  },
};
