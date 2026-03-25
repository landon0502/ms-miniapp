import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
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
  return import.meta.env.VITE_API_BASE_URL + url;
};

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
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
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

export default request;