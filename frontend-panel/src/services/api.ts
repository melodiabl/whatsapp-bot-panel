import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string, rol: string) => {
    const response = await api.post('/auth/register', { username, password, rol });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const whatsappService = {
  getQR: async () => {
    const response = await api.get('/whatsapp/qr');
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/whatsapp/status');
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/whatsapp/logout');
    return response.data;
  },
  getAvailableGroups: async () => {
    const response = await api.get('/whatsapp/groups');
    return response.data;
  },
};

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getBotStatus: async () => {
    const response = await api.get('/bot/status');
    return response.data;
  },
};

export const votacionesService = {
  getAll: async () => {
    const response = await api.get('/votaciones');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/votaciones', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/votaciones/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/votaciones/${id}`);
    return response.data;
  },
};

export const manhwasService = {
  getAll: async () => {
    const response = await api.get('/manhwas');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/manhwas', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/manhwas/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/manhwas/${id}`);
    return response.data;
  },
};

export const aportesService = {
  getAll: async () => {
    const response = await api.get('/aportes');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/aportes', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/aportes/${id}`);
    return response.data;
  },
};

export const pedidosService = {
  getAll: async () => {
    const response = await api.get('/pedidos');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },
  updateStatus: async (id: number, estado: string) => {
    const response = await api.put(`/pedidos/${id}`, { estado });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  },
};

export const logsService = {
  getAll: async () => {
    const response = await api.get('/logs');
    return response.data;
  },
};

export const gruposService = {
  getAll: async () => {
    const response = await api.get('/grupos');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/grupos', data);
    return response.data;
  },
  update: async (jid: string, data: any) => {
    const response = await api.put(`/grupos/${jid}`, data);
    return response.data;
  },
  delete: async (jid: string) => {
    const response = await api.delete(`/grupos/${jid}`);
    return response.data;
  },
};

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  updateRole: async (id: number, rol: string) => {
    const response = await api.put(`/usuarios/${id}`, { rol });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export default api;
