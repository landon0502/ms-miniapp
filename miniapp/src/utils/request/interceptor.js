import { httpCodes, responseCodes } from './code'
import { validURL } from '@/utils/validate'
import { isDev } from '@/contants'
import { cloneDeep, isError, isUndefined } from 'lodash'
import { showToast } from '@/components/PageContainer/context'
/**
 * 错误请求消息处理
 * @param {*} respose
 * @returns
 */
function errorResponseMessageHandler(respose) {
	const { config, data } = respose
	const customConfig = config.custom ?? {}
	// 如果不存在错误消息
	if (!data.errorMsg) {
		return
	}
	/**
	 * 通用提示
	 * 所有sucess !== '1'的响应体都会走这里，如何后端返回的错误消息体存在差异需自行处理
	 */
	const showMessage =
		(customConfig.useMessage || isUndefined(customConfig.useMessage)) && data.errorMsg
	if (showMessage) {
		showToast({ message: data.errorMsg })
	}
}

/**
 * 请求错误处理
 */
async function httpResponeErrorHandler(error) {
	if (isError(error)) {
		return Promise.reject(error)
	}
	const customConfig = error.config?.custom ?? {}
	// 请求状态!==200
	if (error.statusCode !== 200) {
		showToast({
			message: '网络错误，请检查网络连接'
		})
		return Promise.reject(error)
	}
	if (customConfig.raw_response) {
		return error
	}
	// 处理响应错误
	const { data } = error
	if (data.success === true) {
		return error
	}

	if (data) {
		errorResponseMessageHandler(error)
		return Promise.reject(data)
	}
	return Promise.reject(error)
}

/**
 * 获取请求的地址, 判断开发者模式是否走的yapi
 * @param {*} config
 * @returns
 */
function requestConfigHandler(config) {
	config = cloneDeep(config)
	const custom = config.custom ?? {}
	// 格式化请求地址，添加和去除/
	const formatePath = (path) => {
		let returnPath = path
		if (!returnPath.startsWith('/') && !validURL(returnPath)) {
			returnPath = '/' + returnPath
		}
		if (path.endsWith('/')) {
			returnPath = returnPath.slice(0, -1)
		}
		return returnPath
	}
	if (config.url.startsWith('/mock/')) {
		config.baseURL = ''
	}
	// 如何自定义配置中指定了baseURL 直接使用
	if (custom.baseURL) {
		config.baseURL = custom.baseURL
	}
	/**
	 *  如果开发中存在YAPI_MOCK_ID 且设置了import.meta.env.VITE_YAPI_BASEURL
	 *  如果环境为yapi 或者config中存在YAPI_MOCK_ID 则使用yapi接口
	 */
	// 处理代理前缀，如果存在 config.proxyPrefixKey, 生产环境需去掉
	if (custom.proxyPrefixKey) {
		if (isDev) {
			config.url = [
				config.url.startsWith(custom.proxyPrefixKey) ? '' : custom.proxyPrefixKey,
				config.url
			]
				.map(formatePath)
				.join('')
		} else if (config.url.startsWith(custom.proxyPrefixKey)) {
			config.url = config.url.substring(custom.proxyPrefixKey.length)
		}
	}
	if (isDev && custom.raw_response) {
		config.baseURL = ''
	}
	return config
}

/**
 * 请求拦截器
 * @param {*} config
 * @returns
 */
function request(config) {
	config.data = config.data ?? {}
	config.data['_t'] = Date.now()
	config = requestConfigHandler(config)
	// #ifdef APP
	plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
		config.data['app_version'] = widgetInfo.version
	})
	// #endif
	config.header['auth'] = uni.getStorageSync('Authorization') || ''
	return config
}

/**
 * 响应拦截器
 * @param {*} res
 * @returns
 */
function response(res) {
	const customConfig = res.config?.custom ?? {}
	if (customConfig.raw_response) {
		return res
	}

	if (res.statusCode === httpCodes.SUCCESS && res.data) {
		if (res.data.success === responseCodes.SUCCESS) {
			return res.data
		}

		switch (res.data.errorCode) {
			case 401:
				// 未授权，跳转到登录页
				// toLogin();
				break
			case 100001:
				// token 过期

				// 登录过期 重新静默登录
				return
			default:
			// 请求错误, 服务业务错误
		}
		httpResponeErrorHandler(res)
		return Promise.reject(res.data)
	} else if (res.statusCode === httpCodes.UNAUTHORIZED) {
		return Promise.reject(res.data)
	}
	return Promise.reject(res.data)
}

export default {
	request,
	response: [
		response,
		(err) => {
			return httpResponeErrorHandler(err)
		}
	]
}
