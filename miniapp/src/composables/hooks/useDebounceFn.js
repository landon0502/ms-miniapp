import { noop } from 'lodash'
import { createFilterWrapper, debounceFilter } from '@/utils/filter'

/**
 * Debounce execution of a function.
 *
 * @see https://vueuse.org/useDebounceFn
 * @param  fn          A function to be executed after delay milliseconds debounced.
 * @param  ms          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  options     Options
 *
 * @return A new, debounce, function.
 *
 * @__NO_SIDE_EFFECTS__
 */
export default function useDebounceFn(fn = noop, ms = 200, options = {}) {
	let { filter, cancel } = debounceFilter(ms, options)
	return [createFilterWrapper(filter, fn), cancel]
}
