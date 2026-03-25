import { setConfig } from '@/uni_modules/uv-ui-tools/libs/function'

export function defineThemeConfig() {
	setConfig({
		// 修改$uv.config对象的属性
		config: {
			// 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
			color: {
				// 'uv-primary': '#2979ff',
				// 'uv-warning': '#ff9900',
				// 'uv-success': '#19be6b',
				// 'uv-error': '#fa3534',
				// 'uv-info': '#909399',
				// 'uv-main-color': '#303133',
				// 'uv-content-color': '#606266',
				// 'uv-tips-color': '#909399',
				// 'uv-light-color': '#c0c4cc'
			},
			// 修改默认单位为rpx，相当于执行 uni.$uv.config.unit = 'rpx'
			unit: 'px'
		},

		// 修改$uv.props对象的属性【app-vue不支持全局使用uni.$uv.setConfig设置props属性】
		props: {
			// 修改uv-text组件的size参数的默认值，注意：默认值都要用default声明
			// text: {},
			// 其他组件属性配置，具体的参数名称可以去每个组件的props.js中进行查看
			button: {
				customStyle: {
					default: () => ({
						borderRadius: 24,
						width: 200
					})
				}
			}
		}
	})
}
