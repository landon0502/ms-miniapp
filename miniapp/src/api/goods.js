export const fetchGoodsDetail = ({ id }) =>
  uni.$uv.http.get(`/api/miniapp/products/${id}`);
