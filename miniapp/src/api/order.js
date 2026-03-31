export const fetchOrders = (params) =>
  uni.$uv.http.get("/api/miniapp/orders", { params });

export const fetchOrderList = (params) =>
  uni.$uv.http.get("/api/miniapp/orders", { params });


export const fetchOrderDetail = ({id}) =>
  uni.$uv.http.get(`/api/miniapp/orders/${id}`);
