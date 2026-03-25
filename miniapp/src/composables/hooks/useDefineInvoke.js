import { forEach, isEmpty, isFunction } from 'lodash'
import { onUnmounted, ref, toValue, watch } from 'vue'
import useDebounceFn from './useDebounceFn'
/**
 * 当值定义以后才进行执行
 * @param {
 *  fn: Function
 *  callback: { success: Function, fail: Error => void }
 * } source
 * @returns { () => Promise<void> }
 */
export default function useDefineInvoke(source) {
	let fns = []
	const cacheFn = ref([])

	const stopWatcher = watch(
		[() => toValue(source), cacheFn],
		([newVal, newCacheFns]) => {
			if (newVal && !isEmpty(newCacheFns)) {
				// 先停止监听，否则在重置cacheFn时会导致二次执行
				stopWatcher()
				forEach(newCacheFns.filter(Boolean), async ([fn, callback], index) => {
					try {
						isFunction(fn) && (await fn())
						if (isFunction(callback)) {
							callback()
						} else {
							isFunction(callback?.success) && callback.success()
						}
					} catch (error) {
						isFunction(callback?.fail) && callback.fail(error)
					} finally {
						cacheFn.value[index] = []
						fns[index] = []
					}
				})
			}
		},
		{
			deep: true
		}
	)

	const [addFn, cancel] = useDebounceFn((fns) => {
		cacheFn.value = fns.filter(Boolean)
	}, 100)

	onUnmounted(() => {
		stopWatcher()
		cancel()
	})

	return async function (fn, callback) {
		let isInvoke = toValue(source)

		if (isInvoke) {
			try {
				isFunction(fn) && (await fn())
				if (isFunction(callback)) {
					callback()
				} else {
					isFunction(callback?.success) && callback.success()
				}
			} catch (error) {
				isFunction(callback?.fail) && callback?.fail(error)
			}
		} else {
			fns.push([fn, callback])
			addFn(fns)
		}
	}
}
