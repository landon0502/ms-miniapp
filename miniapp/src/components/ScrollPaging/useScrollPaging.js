import { unref, ref } from 'vue'
import { useDebounceFn, useDefineInvoke, useMergeModelValue, useToggle } from '@/composables'
import {
	ON_LOAD,
	ON_LOAD_MORE,
	ON_REFRESH,
	ON_SCROLL_TOLOWER,
	scrollPagingHooksEvents
} from './context'
import { sleep } from '@/uni_modules/uv-ui-tools/libs/function'
import { isUndef } from '@/utils/is'
export default function useScrollPaging(target, options = {}) {
	const [isLoadMore, toggleLoadMoreState] = useToggle(false)
	const { onRefresh, onScrolltolower, onLoad, onLoadMore, notMore, data: pagedData } = options
	const invoke = useDefineInvoke(target)
	const data = useMergeModelValue(() => unref(pagedData), {
		defaultValue: []
	})
	const completedFlag = ref(false)
	/**
	 * 没有更多
	 * @returns
	 */
	const nomore = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).nomore(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 加载数据
	 * @returns
	 */
	const load = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).load(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 刷新
	 * @returns
	 */
	const refresh = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).refresh(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 添加数据
	 * @param {*} list
	 * @param {*} options
	 * @returns
	 */
	const complete = async (list = unref(data), options) => {
		completedFlag.value = true
		if (isUndef(options?.notMore)) {
			options = Object.assign({}, options, { notMore: unref(notMore) })
		}
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).complete(list, options), {
				success: resolve,
				fail: reject
			})
		})
	}

	/**
	 * 设置空状态
	 */
	const setForceShowEmptyStatus = (list = unref(data), options) => {
		return new Promise((resolve, reject) => {
			invoke(
				() => {
					return unref(target).setForceShowEmptyStatus(list, options)
				},
				{
					success: resolve,
					fail: reject
				}
			)
		})
	}

	// 清除副作用
	const distory = () => {
		scrollPagingHooksEvents.clear(unref(target).scrollKey)
	}

	const autoCompleteHandler = async () => {
		if (!completedFlag.value) {
			await complete()
		}
		completedFlag.value = false
	}
	// 初始化事件
	const initEvent = () => {
		distory()
		// 加载事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_LOAD,
			callback: async () => {
				await onLoad?.()
				await autoCompleteHandler()
			},
			onError() {
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).onLoadError(), {
						success: resolve,
						fail: reject
					})
				})
			}
		})
		// 刷新事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_REFRESH,
			callback: async () => {
				await onRefresh?.()
				await autoCompleteHandler()
			},
			onError(error) {
				console.error(error)
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).refreshErrorHandler('刷新失败'), {
						success: resolve,
						fail: reject
					})
				})
			}
		})
		// 加载更多事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_SCROLL_TOLOWER,
			callback: () => {
				return onScrolltolower?.()
			},
			predicate: () => {
				return !isLoadMore.value
			}
		})
		// 防抖
		const [loadMore] = useDebounceFn(async (params) => {
			try {
				toggleLoadMoreState(true)
				await onLoadMore?.(params)
				await autoCompleteHandler()
			} finally {
				toggleLoadMoreState(false)
			}
		}, 300)
		// 加载更多事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_LOAD_MORE,
			callback: loadMore,
			predicate: () => {
				return !isLoadMore.value
			},
			onError() {
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).loadmoreErrorHandler('加载更多失败'), {
						success: resolve,
						fail: reject
					})
				})
			}
		})
	}
	invoke(initEvent)
	return {
		load,
		nomore,
		refresh,
		complete,
		data,
		distory,
		setForceShowEmptyStatus
	}
}
