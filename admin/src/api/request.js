import axios from 'axios';
// 创建axios实例
const request = axios.create({
  baseURL: location.protocol + '//' + (import.meta.env.DEV ? location.hostname : import.meta.env.VITE_API_BASE_URL),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 处理图片路径的工具函数
export const getImageUrl = (url) => {
  if (!url) return '';
  // 如果是全路径，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 如果是相对路径，拼接基础URL
  return location.protocol + '//' + (import.meta.env.DEV ? location.hostname : import.meta.env.VITE_API_BASE_URL) + url;
};

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 统一处理响应数据
    return response;
  },
  error => {
    // 统一处理错误
    
    
    // 检查是否是401错误（token无效或过期）
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 跳转到登录页面
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default request;