import { isEmpty } from 'lodash'
/**
 * 通过组件props筛选出对应值
 */
export function getComponentProps(props, definedProps = {}) {
	if (isEmpty(props)) {
		return {}
	}
	let data = Object.entries(props).reduce((prev, [key, value]) => {
		if (Reflect.has(definedProps, key)) {
			prev[key] = value
		}
		return prev
	}, {})
	return data
}
