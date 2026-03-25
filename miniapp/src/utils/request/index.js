import { isDev } from '@/contants'
import interceptor from './interceptor'
import { requestConfig } from '@/config'
export function initRequest() {
	uni.$uv.http.setConfig((config) => {
		/* config 为默认全局配置*/
		// #ifdef H5
		config.baseURL = isDev ? '' : import.meta.env.VITE_API_BASE_URL /* 根域名 */
		// #endif
		// #ifndef H5
		config.baseURL = import.meta.env.VITE_API_BASE_URL  /* 根域名 */
		// #endif

		return { ...requestConfig, ...config }
	})
	uni.$uv.http.interceptors.request.use(interceptor.request)
	uni.$uv.http.interceptors.response.use(...interceptor.response)
}
