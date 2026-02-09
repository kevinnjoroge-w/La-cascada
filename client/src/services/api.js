import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API Service initialized with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testConnection = async () => {
  try {
    console.log('Testing connection to:', `${API_URL}/test`);
    const response = await api.get('/test');
    console.log('Connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic request methods
api.getApi = (url, params) => api.get(url, { params });
api.postApi = (url, data) => api.post(url, data);
api.putApi = (url, data) => api.put(url, data);
api.patchApi = (url, data) => api.patch(url, data);
api.deleteApi = (url) => api.delete(url);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Rooms API
export const roomsAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  getAvailable: (params) => api.get('/rooms/available', { params }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Tables API
export const tablesAPI = {
  getAll: (params) => api.get('/tables', { params }),
  getById: (id) => api.get(`/tables/${id}`),
  getAvailable: (params) => api.get('/tables/available', { params }),
  reserve: (data) => api.post('/tables/reserve', data),
  getReservations: () => api.get('/tables/reservations'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

// Garden API
export const gardenAPI = {
  getAll: (params) => api.get('/garden', { params }),
  getById: (id) => api.get(`/garden/${id}`),
  getAvailability: (params) => api.get('/garden/availability', { params }),
  book: (data) => api.post('/garden/book', data),
  getUserBookings: () => api.get('/garden/bookings'),
  create: (data) => api.post('/garden', data),
  update: (id, data) => api.put(`/garden/${id}`, data),
  updatePricing: (id, data) => api.put(`/garden/${id}/pricing`, data),
  delete: (id) => api.delete(`/garden/${id}`),
};

// Menu API
export const menuAPI = {
  getFullMenu: () => api.get('/menu/full'),
  getCategories: () => api.get('/menu/categories'),
  getCategory: (id) => api.get(`/menu/categories/${id}`),
  getItems: (params) => api.get('/menu', { params }),
  getItemsByCategory: (categoryId) => api.get(`/menu/category/${categoryId}`),
  getFeatured: () => api.get('/menu/featured'),
  search: (query) => api.get('/menu/search', { params: { q: query } }),
  getItem: (id) => api.get(`/menu/item/${id}`),
  createCategory: (data) => api.post('/menu/categories', data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`),
  createItem: (data) => api.post('/menu/items', data),
  updateItem: (id, data) => api.put(`/menu/items/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/items/${id}`),
  toggleAvailability: (id) => api.put(`/menu/items/${id}/availability`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  addReview: (id, data) => api.post(`/orders/${id}/review`, data),
  getAllAdmin: () => api.get('/orders/all'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  createRoom: (data) => api.post('/bookings/room', data),
  createTable: (data) => api.post('/bookings/table', data),
  createGarden: (data) => api.post('/bookings/garden', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  checkIn: (id) => api.put(`/bookings/${id}/checkin`),
  checkOut: (id) => api.put(`/bookings/${id}/checkout`),
  getAllAdmin: () => api.get('/bookings/all'),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// Payments API
export const paymentsAPI = {
  process: (data) => api.post('/payments', data),
  getHistory: () => api.get('/payments/history'),
  getById: (id) => api.get(`/payments/${id}`),
  refund: (id) => api.post(`/payments/${id}/refund`),
  getAllAdmin: () => api.get('/payments/all'),
  getStats: () => api.get('/payments/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats/overview'),
  getDailySales: (date) => api.get('/admin/sales/daily', { params: { date } }),
  getMonthlySales: (month, year) => api.get('/admin/sales/monthly', { params: { month, year } }),
  getPopularItems: () => api.get('/admin/popular-items'),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
  getBookingAnalytics: (params) => api.get('/admin/bookings', { params }),
  getReports: (params) => api.get('/admin/reports', { params }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

