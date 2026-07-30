import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('x1_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('x1_token');
      localStorage.removeItem('x1_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  signup:         (d) => api.post('/auth/signup', d),
  login:          (d) => api.post('/auth/login', d),
  logout:         ()  => api.post('/auth/logout'),
  getMe:          ()  => api.get('/auth/me'),
  verifyEmail:    (t) => api.get(`/auth/verify-email/${t}`),
  forgotPassword: (e) => api.post('/auth/forgot-password', { email: e }),
  resetPassword:  (t, p) => api.post(`/auth/reset-password/${t}`, { password: p }),
  changePassword: (d) => api.put('/auth/change-password', d),
};

export const companyAPI = {
  getAll:    ()       => api.get('/companies'),
  getBySlug: (s)      => api.get(`/companies/${s}`),
  create:    (d)      => api.post('/companies', d),
  update:    (id, d)  => api.put(`/companies/${id}`, d),
  delete:    (id)     => api.delete(`/companies/${id}`),
};

export const questionAPI = {
  getAll:     (p)      => api.get('/questions', { params: p }),
  getById:    (id)     => api.get(`/questions/${id}`),
  submit:     (d)      => api.post('/questions/submit', d),
  create:     (d)      => api.post('/questions', d),
  bulkCreate: (d)      => api.post('/questions/bulk', d),
  update:     (id, d)  => api.put(`/questions/${id}`, d),
  delete:     (id)     => api.delete(`/questions/${id}`),
};

export const codingAPI = {
  getAll:        (p)      => api.get('/coding', { params: p }),
  getBySlug:     (s)      => api.get(`/coding/${s}`),
  run:           (d)      => api.post('/coding/run', d),
  submit:        (d)      => api.post('/coding/submit', d),
  getSubmissions:(id)     => api.get(`/coding/${id}/submissions`),
  create:        (d)      => api.post('/coding', d),
  update:        (id, d)  => api.put(`/coding/${id}`, d),
};

export const testAPI = {
  getAll:  (p)     => api.get('/tests', { params: p }),
  getById: (id)    => api.get(`/tests/${id}`),
  submit:  (id, d) => api.post(`/tests/${id}/submit`, d),
  create:  (d)     => api.post('/tests', d),
  update:  (id, d) => api.put(`/tests/${id}`, d),
};

export const noteAPI = {
  getAll:  (p) => api.get('/notes', { params: p }),
  create:  (d) => api.post('/notes', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id) => api.delete(`/notes/${id}`),
};

export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics/me'),
  getAdminStats:  () => api.get('/analytics/admin'),
};

export const paymentAPI = {
  createOrder:   (d) => api.post('/payments/create-order', d),
  verifyPayment: (d) => api.post('/payments/verify', d),
  getMyPayments: ()  => api.get('/payments/my-payments'),
};

export const aiAPI = {
  askDoubt:     (d) => api.post('/ai/doubt', d),
  generatePlan: (d) => api.post('/ai/study-plan', d),
};

export const leaderboardAPI = {
  get: (p) => api.get('/leaderboard', { params: p }),
};

export const adminAPI = {
  getStats:    ()      => api.get('/admin/stats'),
  getUsers:    (p)     => api.get('/admin/users', { params: p }),
  toggleUser:  (id)    => api.put(`/admin/users/${id}/toggle`),
  getPayments: ()      => api.get('/admin/payments'),
  createAdmin: (d)     => api.post('/admin/create-admin', d),
};

export const topicAPI = {
  getAll:  (companyId) => api.get('/topics', { params: { company: companyId } }),
  create:  (d)         => api.post('/topics', d),
  update:  (id, d)     => api.put(`/topics/${id}`, d),
  delete:  (id)        => api.delete(`/topics/${id}`),
};

export const userAPI = {
  getProfile:    ()    => api.get('/users/profile'),
  updateProfile: (d)   => api.put('/users/profile', d),
  getBookmarks:  ()    => api.get('/users/bookmarks'),
  addBookmark:   (d)   => api.post('/users/bookmarks', d),
  removeBookmark:(id)  => api.delete(`/users/bookmarks/${id}`),
};
