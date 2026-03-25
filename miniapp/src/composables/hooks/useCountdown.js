import useIntervalFn from './useIntervalFn'
import { ref, toValue } from 'vue'

/**
 * Wrapper for `useIntervalFn` that provides a countdown timer in seconds.
 *
 * @param initialCountdown
 * @param options
 *
 * @see https://vueuse.org/useCountdown
 */
export default function useCountdown(initialCountdown, options) {
	const remaining = ref(toValue(initialCountdown))

	const intervalController = useIntervalFn(
		() => {
			const value = remaining.value - 1
			remaining.value = value < 0 ? 0 : value
			options?.onTick?.()
			if (remaining.value <= 0) {
				intervalController.pause()
				options?.onComplete?.()
			}
		},
		options?.interval ?? 1000,
		{ immediate: options?.immediate ?? false }
	)

	const reset = (countdown) => {
		remaining.value = toValue(countdown) ?? toValue(initialCountdown)
	}

	const stop = () => {
		intervalController.pause()
		reset()
	}

	const resume = () => {
		if (!intervalController.isActive.value) {
			if (remaining.value > 0) {
				intervalController.resume()
			}
		}
	}

	const start = (countdown) => {
		reset(countdown)
		intervalController.resume()
	}

	return {
		remaining,
		reset,
		stop,
		start,
		pause: intervalController.pause,
		resume,
		isActive: intervalController.isActive
	}
}
