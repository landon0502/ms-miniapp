import request from './request';

// 获取促销列表
export const getPromotions = (params) => {
  return request.get('/api/promotions', { params });
};

// 创建促销
export const createPromotion = (data) => {
  return request.post('/api/promotions', data);
};

// 更新促销
export const updatePromotion = (id, data) => {
  return request.put(`/api/promotions/${id}`, data);
};

// 删除促销
export const deletePromotion = (id) => {
  return request.delete(`/api/promotions/${id}`);
};