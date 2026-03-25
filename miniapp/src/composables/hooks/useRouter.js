import router from '@/router'
import { onRouteParamsEventKey, onRouteDataEventKey } from '@/utils/Router'
import { getHistoryPage, pages } from '@/uni_modules/uv-ui-tools/libs/function'
import { onLoad } from '@dcloudio/uni-app'
import { noop } from 'lodash'
import { computed, ref, toRaw } from 'vue'
import useMountedInvoke from './useMountedInvoke'
import { isTabBarPath } from '@/utils/is'
export default function () {
	const mountedInvoke = useMountedInvoke()

	const params = ref({})
	const routerData = ref(router.getPrevRouterDataCache()?.data)
	const currentPage = ref(getHistoryPage())
	const loadedPages = ref(pages())
	const current = computed(() => {
		return loadedPages.value.findIndex((page) => currentPage.value === page)
	})

	/**
	 * router params event
	 * @param {*} callback
	 */
	const onRouteParams = (callback = noop) => {
		mountedInvoke(() => {
			const channal = getHistoryPage().getOpenerEventChannel()
			if (isTabBarPath(getHistoryPage().route)) {
				uni.$on(
					router.getUniEventNameByRouterUrl(onRouteParamsEventKey, currentPage.value.route),
					callback
				)
			} else {
				channal.on(onRouteParamsEventKey, callback)
			}
		})
	}
	/**
	 * router data event
	 * @param {*} callback
	 */
	const onRouteData = (callback = noop) => {
		mountedInvoke(() => {
			const channal = getHistoryPage().getOpenerEventChannel()
			// 在微信小程序中 tabbar页面无法使用 channal，在tabbar页面时同一使用uni event事件处理
			if (isTabBarPath(getHistoryPage().route)) {
				uni.$on(
					router.getUniEventNameByRouterUrl(onRouteDataEventKey, currentPage.value.route),
					(data) => {
						routerData.value = data
						callback(data)
					}
				)
			} else {
				channal.on(onRouteDataEventKey, (data) => {
					routerData.value = data
					callback(data)
				})
			}
			routerData.value && callback(toRaw(routerData))
		})
	}

	onLoad((options) => {
		params.value = options
	})

	return {
		router,
		currentPage,
		loadedPages,
		current,
		params,
		data: routerData,
		onRouteParams,
		onRouteData
	}
}
