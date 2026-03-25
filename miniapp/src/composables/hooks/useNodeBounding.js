import { merge, noop } from 'lodash'
import { ref, onMounted, getCurrentInstance, onUnmounted, shallowRef } from 'vue'
/**
 * 查询节点信息
 * @param {*} param0
 * @returns
 */
export default function useNodeBounding({
	selector,
	isObserver = true,
	onNodeRectUpdate = noop,
	observeOptions
}) {
	// 获取当前小程序页面实例（重点）
	const instance = getCurrentInstance()
	const observer = shallowRef()
	const nodeRect = ref()
	const mergeObserveOptions = merge(
		{
			// #ifdef MP-WEIXIN
			nativeMode: true,
			// #endif
			observeAll: true
		},
		observeOptions ?? {}
	)
	/**
	 * 查询节点
	 * @param {*} selector
	 * @returns
	 */
	const queryNode = async () => {
		try {
			if (!selector) {
				return null
			}
			let res = await instance.ctx.$uv.getRect(selector)
			nodeRect.value = res
			return res
		} catch (error) {
			return Promise.reject(error)
		}
	}

	const initObserver = async () => {
		disconnect()
		let res = await queryNode()
		// 执行查询并创建监听器
		if (res) {
			// 创建监听器
			observer.value = uni.createIntersectionObserver(instance.proxy, mergeObserveOptions)
			observer.value
				.relativeToViewport({ top: 0 })
				.observe(selector, async ({ boundingClientRect }) => {
					nodeRect.value = boundingClientRect
					onNodeRectUpdate(boundingClientRect)
				})
		}
	}

	/**
	 * 停止监听
	 */
	const disconnect = () => {
		observer.value?.disconnect()
	}
	onMounted(() => {
		if (isObserver) initObserver()
	})
	onUnmounted(() => {
		disconnect()
	})

	return { nodeRect, queryNode, disconnect, observer, initObserver }
}
