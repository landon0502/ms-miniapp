import { fetchOrderDetail } from "@/api/order";
import { useRequest } from "@/composables";
export default function useServices() {

  
  const orderDetailControl = useRequest(fetchOrderDetail);
  
  return {
    orderDetailControl
  }
}