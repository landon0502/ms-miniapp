import { isRef, shallowRef, toValue } from 'vue'

/**
 * A boolean ref with a toggler
 *
 * @see https://vueuse.org/useToggle
 * @param [initialValue]
 * @param options
 *
 * @__NO_SIDE_EFFECTS__
 */
export default function useToggle(initialValue = false, options = {}) {
	const { truthyValue = true, falsyValue = false } = options

	const valueIsRef = isRef(initialValue)
	const _value = shallowRef(initialValue)

	function toggle(value) {
		// has arguments
		if (arguments.length) {
			_value.value = value
			return _value.value
		}
		const truthy = toValue(truthyValue)
		_value.value = _value.value === truthy ? toValue(falsyValue) : truthy
		return _value.value
	}

	if (valueIsRef) return toggle
	return [_value, toggle]
}
