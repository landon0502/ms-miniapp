import request from './request';

// 获取商品列表
export const getProducts = (params) => {
  return request.get('/api/products', { params });
};

// 获取商品详情
export const getProductDetail = (id) => {
  return request.get(`/api/products/${id}`);
};

// 创建商品
export const createProduct = (data) => {
  return request.post('/api/products', data);
};

// 更新商品
export const updateProduct = (id, data) => {
  return request.put(`/api/products/${id}`, data);
};

// 删除商品
export const deleteProduct = (id) => {
  return request.delete(`/api/products/${id}`);
};

// 创建商品规格
export const createProductSku = (productId, data) => {
  return request.post(`/api/products/${productId}/skus`, data);
};

// 更新商品规格
export const updateProductSku = (productId, skuId, data) => {
  return request.put(`/api/products/${productId}/skus/${skuId}`, data);
};

// 删除商品规格
export const deleteProductSku = (skuId) => {
  return request.delete(`/api/products/skus/${skuId}`);
};

// 上传图片
export const uploadImage = (formData) => {
  return request.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};