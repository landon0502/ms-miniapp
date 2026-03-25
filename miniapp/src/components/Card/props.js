export default {
	props: {
		/**
		 * 自定义容器样式
		 */
		customStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * header 图标
		 */
		icon: String,
		/**
		 * header 图标大小
		 */
		iconSize: {
			type: [Number, String],
			default: 20
		},
		/**
		 * header 图标颜色
		 */
		iconColor: String,
		/**
		 * header 图标宽度
		 */
		iconWidth: [Number, String],
		/**
		 * header 图标高度
		 */
		iconHeight: [Number, String],
		/**
		 * header 图标 image mode
		 */
		iconImageMode: String,
		/**
		 * 自定义Head样式
		 */
		customHeadStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 自定义content样式
		 */
		customContentStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 自定义footer样式
		 */
		customFooterStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 标题内容
		 */
		title: String,
		/**
		 * 标题显示行数
		 */
		titleLines: {
			type: Number,
			default: 1
		},
		/**
		 * 标题是否加粗
		 */
		titleBold: {
			type: Boolean,
			default: true
		},
		/**
		 * 标题颜色
		 */
		titleColor: {
			type: String,
			default: 'var(--uv-text-color)'
		},
		/**
		 * 标题字体大小
		 */
		titleSize: {
			type: String,
			default: '14px'
		},
		/**
		 * 标题字体行高
		 */
		titleLineHeight: {
			type: String || Number
		},
		/**
		 * 显示header
		 */
		showHeader: {
			type: Boolean,
			default: true
		},
		/**
		 * 显示header 底部边框
		 */
		showHeadLine: Boolean,
		/**
		 * 头部分割线样式
		 */
		headLineProps: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 自定义head line样式
		 */
		customHeadLineStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 头部图标样式
		 */
		headIconStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 标题布局样式
		 */
		titleWrapStyle: {
			type: Object,
			default() {
				return {}
			}
		}
	}
}
