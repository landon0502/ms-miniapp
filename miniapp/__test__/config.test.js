import { describe, expect, it } from 'vitest'

import { getRequestEnv } from '@/config'
describe('test utils', () => {
	it('获取当前h5部署环境', () => {
		let env = getRequestEnv('http://scmxcxsim.cnzhonglunnet.com')
		console.log('==>', env)
		expect(env).toBe('sim')
	})
})
