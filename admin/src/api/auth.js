import request from './request';

// 登录
export const login = async (data) => {
  try {
    const response = await request.post('/api/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 注册
export const register = async (data) => {
  try {
    const response = await request.post('/api/auth/register', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 单点登录
export const ssoLogin = async (data) => {
  try {
    const response = await request.post('/api/auth/sso', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 验证token
export const verifyToken = async (token) => {
  try {
    const response = await request.post('/api/auth/verify', { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};