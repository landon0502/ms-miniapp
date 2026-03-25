import uvNavbarProps from '@/uni_modules/uv-navbar/components/uv-navbar/props.js'
export default {
	props: {
		...uvNavbarProps.props,
		// 左侧文字样式
		leftTextStyle: {
			type: Object,
			default: () => ({})
		},
		// 是否避开安全胶囊，小程序上有效
		avoidMenuButton: {
			type: Boolean,
			default: false
		},
		showBottomLine: Boolean
	}
}
