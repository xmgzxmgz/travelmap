/**
 * API服务配置和请求方法
 */

import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取用户信息
  getProfile: () => api.get('/auth/profile'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // 修改密码
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// 行程API
export const tripsAPI = {
  // 获取所有行程
  getTrips: () => api.get('/trips'),
  
  // 创建新行程
  createTrip: (tripData) => api.post('/trips', tripData),
  
  // 获取单个行程
  getTrip: (tripId) => api.get(`/trips/${tripId}`),
  
  // 更新行程
  updateTrip: (tripId, tripData) => api.put(`/trips/${tripId}`, tripData),
  
  // 删除行程
  deleteTrip: (tripId) => api.delete(`/trips/${tripId}`),
  
  // 添加POI到行程
  addPOI: (tripId, poiData) => api.post(`/trips/${tripId}/pois`, poiData),
  
  // 从行程移除POI
  removePOI: (tripId, poiId) => api.delete(`/trips/${tripId}/pois/${poiId}`),
  
  // 规划行程路线
  planTrip: (tripId) => api.post(`/trips/${tripId}/plan`),
};

// POI API
export const poisAPI = {
  // 搜索POI
  searchPOIs: (params) => api.get('/pois/search', { params }),
  
  // 获取附近POI
  getNearbyPOIs: (params) => api.get('/pois/nearby', { params }),
  
  // 获取POI分类
  getCategories: () => api.get('/pois/categories'),
  
  // 获取POI详情
  getPOI: (poiId) => api.get(`/pois/${poiId}`),
  
  // 创建自定义POI
  createCustomPOI: (poiData) => api.post('/pois/custom', poiData),
  
  // 获取愿望清单
  getWishlist: () => api.get('/pois/wishlist'),
};

// 通用API方法
export const apiUtils = {
  // 健康检查
  healthCheck: () => axios.get(`${API_BASE_URL.replace('/api', '')}/health`),
  
  // 获取API信息
  getAPIInfo: () => axios.get(`${API_BASE_URL.replace('/api', '')}/api`),
};

export default api;