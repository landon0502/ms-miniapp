import { describe, expect, it } from 'vitest'

import { isEmpty } from 'lodash'
describe('test utils', () => {
	it('这是一个单元测试案例', () => {
		let res1 = isEmpty({})
		let res2 = isEmpty([])
		expect([res1, res2]).toEqual([true, true])
	})
})
