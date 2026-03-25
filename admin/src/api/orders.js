import request from './request';

// 获取订单列表
export const getOrders = (params) => {
  return request.get('/api/orders', { params });
};

// 创建订单
export const createOrder = (data) => {
  return request.post('/api/orders', data);
};

// 更新订单
export const updateOrder = (id, data) => {
  return request.put(`/api/orders/${id}`, data);
};

// 删除订单
export const deleteOrder = (id) => {
  return request.delete(`/api/orders/${id}`);
};