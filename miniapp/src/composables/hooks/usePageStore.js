import { getHistoryPage } from '@/uni_modules/uv-ui-tools/libs/function'
import { isNull, isObject, isUndefined } from 'lodash'
import {  reactive } from 'vue'

function createPageStore(page) {
	const currentPage = page ?? getHistoryPage()
	const store = currentPage._currentPageStores ?? {}
	if (isUndefined(currentPage._currentPageStores)) {
		currentPage._currentPageStores = store
	}
	return store
}

/**
 * 页面级数据仓库
 * 在当前页面生成store 只在当前页面生效
 */
export default function usePageStore(storeKey) {
	const curPage = getHistoryPage()
	/**
	 * 初始化仓库
	 */
	const initPageStore = () => {
		const store = createPageStore(curPage)
		if (isUndefined(store[storeKey])) {
			store[storeKey] = reactive({})
		}
		return store
	}
	initPageStore()

	/**
	 * 设置值
	 * @param {string} key
	 * @returns
	 */
	const setStoreItem = (key, value) => {
		const currentStore = getStore()
		currentStore[key] = value
	}

	/**
	 * 获取值
	 * @param {string} key
	 * @returns
	 */
	const getStoreItem = (key) => {
		const currentStore = getStore()
		return currentStore[key]
	}

	/**
	 * 删除值
	 * @param {*} key
	 */
	const removeStoreItem = (key) => {
		const currentStore = getStore()
		Reflect.deleteProperty(currentStore, key)
	}

	/**
	 * 设置store
	 */
	const setStore = (value) => {
		if (isUndefined(value) || isNull(value)) {
			return
		}
		if (!isObject(value)) {
			throw new Error('The "store" must be an object.')
		}
		Object.entries(value).forEach(([key, value]) => {
			setStoreItem(key, value)
		})
	}

	/**
	 * 获取store
	 * @returns reactive
	 */
	const getStore = (key = storeKey) => {
		const store = createPageStore(curPage)
		if (isUndefined(store[key])) {
			initPageStore(key)
		}
		return store[key]
	}

	/**
	 * 	清空store
	 */
	const clearStore = () => {
		const currentStore = getStore()
		Object.entries(currentStore).forEach(([key]) => {
			Reflect.deleteProperty(currentStore, key)
		})
	}

	return {
		setStoreItem,
		getStoreItem,
		removeStoreItem,
		getStore,
		clearStore,
		setStore
	}
}
