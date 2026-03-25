import { ref as deepRef, shallowReadonly, toValue, watch } from 'vue'
import useDebounceFn from './useDebounceFn'
import { isFunction, omit } from 'lodash'

/**
 * Debounce updates of a ref.
 *
 * @return A new debounced ref.
 */
export default function refDebounced(value, ms = 200, options = {}) {
	const debounced = deepRef(toValue(value))

	const [updater] = useDebounceFn(
		() => {
			debounced.value = value.value
		},
		ms,
		omit(options, ['delayUpdateRule'])
	)

	watch(value, (newValue) => {
		if (
			!isFunction(options.delayUpdateRule) ||
			(isFunction(options.delayUpdateRule) && options.delayUpdateRule(newValue))
		) {
			updater()
		} else {
			debounced.value = newValue
		}
	})

	return shallowReadonly(debounced)
}
