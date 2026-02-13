const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        error: json?.message || json?.error || `Eroare ${res.status}`,
        status: res.status,
      };
    }

    return { data: json as T, status: res.status };
  } catch {
    return { error: 'Nu se poate conecta la server', status: 0 };
  }
}

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; refreshToken: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (email: string, password: string, displayName: string) =>
    api<{ token: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
    }),
  refresh: (refreshToken: string) =>
    api<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
};

// Posts endpoints
export const postsApi = {
  list: (params?: { type?: string; category?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    return api(`/posts?${query}`);
  },
  get: (id: string) => api(`/posts/${id}`),
  create: (data: unknown, token: string) =>
    api('/posts', { method: 'POST', body: data, token }),
  update: (id: string, data: unknown, token: string) =>
    api(`/posts/${id}`, { method: 'PATCH', body: data, token }),
  delete: (id: string, token: string) =>
    api(`/posts/${id}`, { method: 'DELETE', token }),
};

// Matches endpoints
export const matchesApi = {
  list: (token: string) => api('/matches', { token }),
  confirm: (id: string, token: string) =>
    api(`/matches/${id}/confirm`, { method: 'POST', token }),
  reject: (id: string, token: string) =>
    api(`/matches/${id}/reject`, { method: 'POST', token }),
};

// Chat endpoints
export const chatApi = {
  conversations: (token: string) => api('/conversations', { token }),
  messages: (conversationId: string, token: string) =>
    api(`/conversations/${conversationId}/messages`, { token }),
  send: (conversationId: string, content: string, token: string) =>
    api(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
      token,
    }),
};

// Map endpoints
export const mapApi = {
  posts: (params?: { type?: string; bounds?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.bounds) query.set('bounds', params.bounds);
    return api(`/map?${query}`);
  },
  heatZones: () => api('/map/heat-zones'),
};

// Notifications endpoints
export const notificationsApi = {
  list: (token: string) => api('/notifications', { token }),
  markRead: (id: string, token: string) =>
    api(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllRead: (token: string) =>
    api('/notifications/read-all', { method: 'POST', token }),
};

// Reports
export const reportsApi = {
  submit: (data: { targetType: string; targetId: string; reason: string; details?: string }, token: string) =>
    api('/reports', { method: 'POST', body: data, token }),
};
