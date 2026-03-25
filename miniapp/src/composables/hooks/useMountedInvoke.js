import { noop } from 'lodash'
import useDefineInvoke from './useDefineInvoke'
import { onMounted, ref } from 'vue'

/**
 * 当onMounted生命周期已触发才执行回调
 * @param {function} cb
 * @returns
 */
export default function useMountedInvoke() {
	const isMounted = ref(false)

	const invoke = useDefineInvoke(isMounted)
	onMounted(() => {
		isMounted.value = true
	})
	return (cb = noop) => {
		invoke(() => cb())
	}
}
