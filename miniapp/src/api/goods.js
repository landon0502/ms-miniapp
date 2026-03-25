export const fetchGoodsDetail = ({ id }) =>
  uni.$uv.http.get(`/api/products/${id}`);
