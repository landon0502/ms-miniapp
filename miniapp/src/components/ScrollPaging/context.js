import { EventBus } from '@/utils/bus'
import { noop } from 'lodash'

/**加载 */
export const ON_LOAD = 'onLoad'
/** 刷新 */
export const ON_REFRESH = 'onRefresh'
/** 滑动到底部 */
export const ON_SCROLL_TOLOWER = 'onScrollToLower'
/** 加载更多 */
export const ON_LOAD_MORE = 'onLoadMore'
/** 刷新状态配置 */
export const defaultRefreshStatusTextConfig = {
	allow: '松开立即刷新',
	not: '继续下拉刷新',
	complete: '刷新完成',
	fail: '请求失败'
}
function getEventNames(event, key) {
	return {
		event: event + '_' + key,
		endEvent: event + '__cap' + '_' + key
	}
}

/**
 * 分页组件钩子事件
 */
export class HooksEvents {
	events = new EventBus()
	constructor(options) {
		if (options.events) {
			this.events = options.events
		}
	}
	/**
	 * 触发一个事件，接受一个相应回调
	 * @param {*} eventName
	 * @param {*} callback
	 */
	trigger({ key, eventName, callback = noop, onError = noop }) {
		const { event, endEvent } = getEventNames(eventName, key)
		this.events.$once(endEvent, async (...args) => {
			try {
				await callback(...args)
			} catch (error) {
				onError(error)
			}
		})
		this.events.$emit(event)
	}
	/**
	 * 捕获一个事件，并在callback执行完成后响应回去
	 * @param {*} param0
	 */
	async cap({
		key,
		eventName,
		callback = noop,
		predicate = () => Promise.resolve(true),
		onError = noop
	}) {
		const { event, endEvent } = getEventNames(eventName, key)
		this.events.$on(event, async (params) => {
			try {
				let isAllow = await predicate()
				if (isAllow) {
					let res = await callback(params)
					this.events.$emit(endEvent, res)
				}
			} catch (error) {
				onError(error)
			}
		})
	}
	/**
	 * 清除当前组件所有监听事件
	 */
	clear(key) {
		if (!key) return
		let refreshEvent = getEventNames(ON_REFRESH, key)
		this.events.$off(refreshEvent.event)
		this.events.$off(refreshEvent.endEvent)

		let scrollTolowerEvent = getEventNames(ON_SCROLL_TOLOWER, key)
		this.events.$off(scrollTolowerEvent.event)
		this.events.$off(scrollTolowerEvent.endEvent)

		let loadMoreEvent = getEventNames(ON_LOAD_MORE, key)
		this.events.$off(loadMoreEvent.event)
		this.events.$off(loadMoreEvent.endEvent)
	}
}
export const scrollPagingHooksEvents = new HooksEvents({ events: new EventBus() })
