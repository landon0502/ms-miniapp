import { isDev } from '@/contants'

export const requestConfig = {
	baseUrl: '', // 请求的根域名
	// 默认的请求头
	header: {},
	method: 'POST',
	// 设置为json，返回后uni.request会对数据进行一次JSON.parse
	dataType: 'json',
	// 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
	responseType: 'text',
	loadingTime: 800 // 在此时间内，请求还没回来的话，就显示加载中动画，单位ms
}



/**
 * 默认门店编码
 */
export const branchcode = '002'
