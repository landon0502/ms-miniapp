import { cloneDeep, isArray, isEmpty, isUndefined, noop, pick } from 'lodash'
import { ref, toValue, unref } from 'vue'
import useToggle from './useToggle'

const defaultPaingParamsKeys = {
	page: 'page',
	pageSize: 'pageSize'
}

const defaultPagingResponeKeys = {
	page: 'page',
	pageSize: 'pageSize',
	totalRecords: 'total',
	list: 'list'
}

function toValues(values) {
	return Object.entries({ ...values }).reduce((acc, [key, value]) => {
		return {
			...acc,
			[key]: toValue(value)
		}
	}, {})
}

/**
 * 获取请求参数
 * @param {*} param0
 * @returns
 */
function getRequestParams({ params, pagingParams, enablePaging }) {
	if (!enablePaging) {
		return params
	}
	return Object.assign({}, pagingParams, params)
}

/**
 * 处理成功回调
 */
async function onSuccessHandler(options, onSuccess = noop) {
	onSuccess(toValues(options))
}

/**
 * 获取分页配置
 */
function getPagination(data, keys = defaultPagingResponeKeys) {
	// 返回数据为数组且存在分页时 记录所以数据
	const getDataInArray = (key) => {
		let ls = key ? data[key] : data
		return isArray(ls) ? ls : []
	}
	return {
		page: data[keys.page],
		pageSize: data[keys.pageSize],
		totalRecords: data[keys.totalRecords],
		list: getDataInArray(keys.list)
	}
}

/**
 * 处理分页数据
 */
function pageHandler({
	data = {},
	pagination,
	params,
	pagedData,
	noMoreData,
	responsePageKeys = defaultPagingResponeKeys,
	pagingParamsKeys = defaultPaingParamsKeys
}) {
	let accData = [...pagedData]
	const { page, pageSize, totalRecords, list } = getPagination(data, responsePageKeys)
	if (!noMoreData) {
		let oldPageIndex = pagination.page ?? 0,
			newPageIndex = params?.[pagingParamsKeys.page] ?? 0
		// 当pageIndex === 1时 不需要拼接
		if (Number(newPageIndex) <= 1) {
			accData = list
		} else if (oldPageIndex >= 1 && oldPageIndex < newPageIndex) {
			accData = [...accData, ...list]
		}
		if (!isUndefined(page)) {
			if (!isUndefined(totalRecords)) {
				noMoreData = totalRecords <= accData.length
			} else {
				noMoreData = list.length < params?.pageSize
			}
		}
	}

	return {
		total: totalRecords,
		noMoreData,
		pagination: {
			page,
			pageSize,
			totalRecords
		},
		pagedData: accData
	}
}

/**
 * 具体请求处理
 * @typedef {{
 *  loading: import("vue").Ref<boolean>
 *  data: import("vue").Ref
 *  rows: import("vue").Ref<any[]>
 *  pagination: import("vue").Ref<{
 *    pageIndex: number
 *    pageSize: number
 *    total: number
 *    totalPage: number
 *  }>
 * }} UseRequestRunningOptions
 *
 * @param { (params:T) => ReturnType<import('@/utils/http/http').ajax> } service
 * @param { UseRequestRunningOptions & {params:T} } options
 */
async function runService(service, options = {}) {
	const {
		loading,
		params,
		config,
		response,
		data,
		pagination,
		enablePaging,
		pagedData,
		total,
		noMoreData,
		onSuccess,
		updateLoadState,
		onNomore = noop,
		pagingParamsKeys
	} = options
	updateLoadState(true)
	try {
		const res = await service(params, config)
		response.value = res
		data.value = response.value?.data
		if (data.value) {
			// 如果启用了分页
			if (enablePaging && data.value.page) {
				const pageInfo = pageHandler({
					params: unref(params),
					data: unref(data),
					pagination: unref(pagination),
					pagedData: unref(pagedData),
					pagingParamsKeys
				})
				noMoreData.value = pageInfo.noMoreData
				pagedData.value = pageInfo.pagedData
				pagination.value = pageInfo.pagination
				if (pageInfo.noMoreData) {
					onNomore()
				}
			}

			onSuccessHandler(
				{
					loading,
					params,
					config,
					response,
					data,
					pagination,
					enablePaging,
					pagedData,
					total,
					noMoreData
				},
				onSuccess
			)
		}

		return res
	} finally {
		updateLoadState(false)
	}
}

/**
 * 通用请求hooks
 * @param {() => import('@climblee\uv-ui\libs\luch-request\index.js')} service
 * @typedef {{ onNomore: Function,  params: any, responsePageKeys: object, pagingParams: object, immediate: boolean, enablePaging: boolean }} RequestOptions
 * @property { Function } onNomore 没有更多的数据时触发
 * @property { any } params 默认请求参数
 * @property { object } responsePageKeys 响应分页数据keys
 * @property { object } pagingParams 分页参数配置
 * @property { boolean } immediate 是否立即执行一次
 * @property { boolean } enablePaging 是否启用分页
 * @param {RequestOptions} options
 * @returns
 *
 * @example const { data, loading, ... } = useRequest(service, { ...... })
 */
export default function useRequest(service, options = {}) {
	const {
		onNomore = noop,
		params,
		responsePageKeys = {},
		pagingParams = {
			[defaultPaingParamsKeys.pageSize]: 20,
			[defaultPaingParamsKeys.page]: 1
		},
		immediate = false,
		enablePaging
	} = options

	const [loading, updateLoadState] = useToggle(false)

	const refOptions = {
		// 请求loading
		loading,
		// 更新请求状态
		updateLoadState,
		// 成功响应的data
		data: ref(),
		// 分页配置
		pagination: ref({
			page: 0,
			pageSize: 0,
			totalRecords: 0
		}),
		// 总数据量
		total: ref(),
		// 全量响应体
		response: ref(),
		// 分页数据
		pagedData: ref([]),
		// 没有更多状态
		noMoreData: ref(false),
		// 请求参数
		requestParams: ref(cloneDeep(unref(params) ?? {})),
		// 分页参数
		pagingParams: ref(cloneDeep(unref(pagingParams) ?? {})),
		// 是否启用分页
		enablePaging: ref(unref(enablePaging))
	}

	// 默认配置项
	const defaultOptions = toValues(
		cloneDeep(
			pick(refOptions, [
				'loading',
				'data',
				'pagination',
				'total',
				'response',
				'pagedData',
				'noMoreData'
			])
		)
	)

	/**
	 * 请求
	 * @param {{ params: any; enablePaging: boolean, pagingParamsKeys: object, pagingParams: any }} options
	 * @property { any } params 请求参数
	 * @property { boolean } enablePaging 是否启用分页
	 * @property { object } pagingParamsKeys 分页参数映射key 默认值：{page:'page', pageSize: 'pageSize'}
	 * @property { object } pagingParams 分页参数
	 * @returns { Promise<Response> }
	 */
	const fetchData = async ({
		params = refOptions.requestParams.value,
		config = {},
		enablePaging = refOptions.enablePaging.value,
		pagingParamsKeys = defaultPaingParamsKeys,
		pagingParams = refOptions.pagingParams.value
	}) => {
		refOptions.requestParams.value = params
		if (!isEmpty(pagingParams)) {
			refOptions.pagingParams.value = { ...refOptions.pagingParams.value, ...pagingParams }
		}
		// 整合参数
		const serviceParams = getRequestParams({
			enablePaging,
			params: refOptions.requestParams.value,
			pagingParams: refOptions.pagingParams.value
		})
		return runService(service, {
			...refOptions,
			params: serviceParams,
			config,
			onSuccess: config.onSuccess ?? options.onSuccess,
			enablePaging,
			onNomore,
			responsePageKeys,
			pagingParamsKeys
		})
	}

	// 立即执行一次
	immediate &&
		fetchData({
			fetchParams: refOptions.requestParams.value,
			config: options.config,
			enablePaging: options.enablePaging,
			pagingParams: refOptions.pagingParams.value
		}).then((res) => {
			options.responseOnceCallback?.(res)
			onSuccessHandler(refOptions, options.onSuccess)
		})

	/**
	 * 请求下一页数据
	 * @returns
	 */
	const nextPage = async () => {
		if (!options.enablePaging || refOptions.noMoreData.value) {
			return
		}
		try {
			refOptions.pagingParams.value.page = Number(refOptions.pagingParams.value.page) + 1
			return fetchData({
				params: refOptions.requestParams.value,
				pagingParams: refOptions.pagingParams.value,
				enablePaging: true
			})
		} catch {
			refOptions.pagingParams.value.page -= 1
		}
	}

	/**
	 * 重置分页数据
	 * @returns
	 */
	const resetPage = async () => {
		if (!options.enablePaging) {
			return
		}
		refOptions.pagingParams.value.page = 1

		Object.entries(defaultOptions).forEach(([key, defaultValue]) => {
			refOptions[key].value = defaultValue
		})
		return fetchData({
			params: refOptions.requestParams.value,
			pagingParams: refOptions.pagingParams.value,
			enablePaging: true
		})
	}
	return {
		...refOptions,
		/**
		 * 执行请求
		 * @param {*} params 请求参数
		 * @param { RequestOptions } options 请求配置，与useRequest options参数一致
		 * @returns
		 */
		run: (params, options = {}) => fetchData({ params, ...options }),
		nextPage,
		resetPage
	}
}
