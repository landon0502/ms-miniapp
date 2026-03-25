import { isRef, shallowReadonly, shallowRef, toValue, watch } from 'vue'
import { tryOnScopeDispose } from '@/utils/shared'

/**
 * Wrapper for `setInterval` with controls
 *
 * @see https://vueuse.org/useIntervalFn
 * @param cb
 * @param interval
 * @param options
 */
export default function useIntervalFn(cb, interval = 1000, options = {}) {
	const { immediate = true, immediateCallback = false } = options

	let timer = null
	const isActive = shallowRef(false)

	function clean() {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	}

	function pause() {
		isActive.value = false
		clean()
	}

	function resume() {
		const intervalValue = toValue(interval)
		if (intervalValue <= 0) return
		isActive.value = true
		if (immediateCallback) cb()
		clean()
		if (isActive.value) timer = setInterval(cb, intervalValue)
	}

	if (immediate) resume()

	if (isRef(interval) || typeof interval === 'function') {
		const stopWatch = watch(interval, () => {
			if (isActive.value) resume()
		})
		tryOnScopeDispose(stopWatch)
	}

	tryOnScopeDispose(pause)

	return {
		isActive: shallowReadonly(isActive),
		pause,
		resume
	}
}
