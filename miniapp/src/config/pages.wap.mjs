/**
 * 页面映射配置
 * 用于生成 pages.json
 */
export const pageMap = [
	{
		path: 'wap/order-detail-list/index',
		style: {
			navigationBarTitleText: '订单明细',
			navigationStyle: 'custom'
		}
	}
]

// 全局配置
export const globalConfig = {
	easycom: {
		custom: {
			'^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
				'z-paging/components/z-paging$1/z-paging$1.vue'
		}
	},
	globalStyle: {
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'uni-app',
		navigationBarBackgroundColor: '#F8F8F8',
		backgroundColor: '#F8F8F8',
		bounce: 'none'
	},
	// tabBar: {
	// 	custom: true,
	// 	height: '0px',
	// 	list: []
	// },
	condition: {
		current: 0,
		list: []
	}
}
