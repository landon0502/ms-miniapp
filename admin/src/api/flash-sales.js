import request from './request';

// 获取秒杀活动列表
export const getFlashSales = (params) => {
  return request.get('/api/flash-sales', { params });
};

// 创建秒杀活动
export const createFlashSale = (data) => {
  return request.post('/api/flash-sales', data);
};

// 更新秒杀活动
export const updateFlashSale = (id, data) => {
  return request.put(`/api/flash-sales/${id}`, data);
};

// 删除秒杀活动
export const deleteFlashSale = (id) => {
  return request.delete(`/api/flash-sales/${id}`);
};