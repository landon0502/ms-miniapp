import { fetchOrders, fetchOrderDetail } from "@/api/order";
import { useRequest } from "@/composables";
export default function useServices() {
  const ordersListControl = useRequest(fetchOrders, {
    enablePaging: true
  });
  
  const orderDetailControl = useRequest(fetchOrderDetail);
  
  return {
    ordersListControl,
    orderDetailControl
  }
}