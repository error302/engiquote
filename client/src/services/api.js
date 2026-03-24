import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  getUsers: () => api.get('/auth/users'),
  toggleUserStatus: (id) => api.put(`/auth/users/${id}/toggle`)
};

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const projectsApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const quotesApi = {
  getAll: () => api.get('/quotes'),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
  duplicate: (id) => api.post(`/quotes/${id}/duplicate`)
};

export const materialsApi = {
  getAll: () => api.get('/materials'),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

export const laborRatesApi = {
  getAll: () => api.get('/labor-rates'),
  create: (data) => api.post('/labor-rates', data),
  update: (id, data) => api.put(`/labor-rates/${id}`, data),
  delete: (id) => api.delete(`/labor-rates/${id}`)
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

export const emailApi = {
  sendQuote: (data) => api.post('/email/send-quote', data)
};

export const templatesApi = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`)
};

export const invoicesApi = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  createFromQuote: (data) => api.post('/invoices/from-quote', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  delete: (id) => api.delete(`/invoices/${id}`)
};

export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
};

export const attachmentsApi = {
  upload: (file, entityType, entityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    return api.post('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByEntity: (entityType, entityId) => 
    api.get('/attachments', { params: { entityType, entityId } }),
  getById: (id) => api.get(`/attachments/${id}`),
  delete: (id) => api.delete(`/attachments/${id}`)
};

export const paymentsApi = {
  createStripeCheckout: (invoiceId) => 
    api.post('/payments/stripe/create-checkout', { invoiceId }),
  initiateMpesa: (invoiceId, phoneNumber) => 
    api.post('/payments/mpesa/stkpush', { invoiceId, phoneNumber }),
  getByInvoice: (invoiceId) => 
    api.get(`/payments/${invoiceId}`)
};

export default api;
