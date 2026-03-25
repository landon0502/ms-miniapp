export const fetchOrders = (params) =>
  uni.$uv.http.get("/api/orders", { params });

export const fetchOrderList = (params) =>
  uni.$uv.http.get("/api/orders", { params });

export const fetchOrderNumbers = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.order.numbers.v5/1.0.0/action", params);

export const cancelOrder = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.order.cancle.v5/1.0.0/action", params);

export const undoAfterSales = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.order.undoAfterSales.v5/1.0.0/action",
    params
  );

export const confirmRecive = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.order.confirmReceive.v5/1.0.0/action",
    params
  );

export const fetchOrderInfo = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.order.detail.v5/1.0.0/action", params);

export const submitAfterSales = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.order.submitAfterSales.v5/1.0.0/action",
    params
  );

export const fetchAfterSalesReason = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.config.list.v5/1.0.0/action", params);

export const sumbitOrder = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.pay.commit.v5/1.0.0/action", params);

export const fetchPayGoodsOrderDetails = (params) =>
  uni.$uv.http.post("/zl.bs.sc.xcx.payGoodsDetail.v5/1.0.0/action", params);

export const fetchExpress = (params) =>
  uni.$uv.http.post("/zl.bs.sc.web.order.expressQuery.v5/1.0.0/action", params);

export const saveReturnExpress = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.aftersales.savereturnexpress.v5/1.0.0/action",
    params
  );

export const querySCPurchaserOrderAfterExpress = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.aftersales.querySCPurchaserOrderAfterExpress.v5/1.0.0/action",
    params
  );

export const updateAfterSaleOrder = (params) =>
  uni.$uv.http.post(
    "/zl.bs.sc.xcx.order.updateAfterSaleOrder.v5/1.0.0/action",
    params
  );

export const fetchOrderDetail = ({id}) =>
  uni.$uv.http.get(`/api/orders/${id}`);
