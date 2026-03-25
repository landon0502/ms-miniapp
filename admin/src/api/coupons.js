import request from './request';

// 获取优惠券列表
export const getCoupons = (params) => {
  return request.get('/api/coupons', { params });
};

// 创建优惠券
export const createCoupon = (data) => {
  return request.post('/api/coupons', data);
};

// 更新优惠券
export const updateCoupon = (id, data) => {
  return request.put(`/api/coupons/${id}`, data);
};

// 删除优惠券
export const deleteCoupon = (id) => {
  return request.delete(`/api/coupons/${id}`);
};