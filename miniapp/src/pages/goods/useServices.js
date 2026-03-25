import { fetchGoodsDetail } from "@/api/goods";
import { useRequest } from "@/composables";
export default function useServices() {
  const goodsDetailControl = useRequest(fetchGoodsDetail);
  
  return {
    goodsDetailControl
  }
}
