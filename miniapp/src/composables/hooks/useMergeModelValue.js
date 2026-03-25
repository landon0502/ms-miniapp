import { isObject, isUndefined } from 'lodash'
import { customRef, toValue, watch, ref } from 'vue'

/**
 * @desc 合并 modelValue
 * 主要解决在组件中 modelvalue会存在 可控和不可控两种情况，当modelValue 为空时，则需要临时ref，且当modelValue有值时，临时值也会动态更改
 * @param {import('vue').Ref} modelValue
 * @param {{
 * get: function, // 当获取值是触发
 * set: function, // 当设置值是触发
 * onBeforeSet: function // 每次设置值前触发
 * }} options
 */
export default function useMergeModelValue(modelValue, options = {}) {
	if (!isUndefined(options) && !isObject(options))
		throw new Error(`The options parameter should be an object, currently an ${typeof options}!`)
	let _value = ref(toValue(modelValue) ?? options?.defaultValue)
	watch(
		() => toValue(modelValue),
		(newVal) => {
			options?.onBeforeSet?.(newVal)
			_value.value = newVal
		},
		{ deep: options?.deep, once: options?.onceWatch }
	)

	return customRef((track, trigger) => {
		return {
			get() {
				track()
				options?.get?.(_value.value)
				return _value.value
			},
			set(newValue) {
				options.onBeforeSet?.(newValue)
				_value.value = newValue
				trigger()
				options?.set?.(_value.value)
			}
		}
	})
}
