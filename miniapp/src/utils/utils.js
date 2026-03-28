import { isString, isPlainObject, isArray, isEmpty, isFunction } from 'lodash'
import { deepClone, getHistoryPage } from '@/uni_modules/uv-ui-tools/libs/function'
import { validURL } from './validate'
// #ifdef MP-WEIXIN
import UUID from './UUID'
// #endif
// #ifndef MP-WEIXIN
import { v4 as uuid } from 'uuid'
// #endif
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
/**
 * 手机号加密
 */
export const phoneEncrypt = (phone) => {
	if (phone) {
		return phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
	}
	return ''
}

/**
 * 金字塔分组
 * @param {*} arr
 * @returns
 */
export function pyramidGrouping(arr) {
	const result = []
	let currentIndex = 0
	let level = 1 // 金字塔层级，第n层有n个元素

	while (currentIndex < arr.length) {
		const levelItems = arr.slice(currentIndex, currentIndex + level)
		result.push(levelItems)
		currentIndex += level
		level++
	}

	return result
}

/**
 * 解析json字符串
 */
export function sefaJsonParse(jsonString) {
	try {
		return JSON.parse(jsonString)
	} catch {
		return void 0
	}
}

/**
 * 获取值类型
 */
export function getValueType(value) {
	let t = Object.prototype.toString.call(value)
	let reg = /^\[(object){1}\s{1}(\w+)\]$/i
	return t.replace(reg, '$2').toLowerCase()
}

export const safeParse = (input, defaultValue = {}) => {
	if (input) {
		try {
			return JSON.parse(input)
		} catch (ex) {
			console.error(ex)
		}
	}
	return defaultValue
}

export const expectArray = (input) => {
	if (input) {
		if (Array.isArray(input)) {
			return input
		}
		const value = safeParse(input, [])
		if (isString(value)) {
			return expectArray(value)
		}
		return Array.isArray(value) ? value : []
	}
	return []
}

export const expectObject = (input) => {
	if (input) {
		if (isPlainObject(input)) {
			return input
		}
		const value = safeParse(input, {})
		return isPlainObject(value) ? value : {}
	}
	return {}
}

/**
 * 生成uuid
 */
export function genUuid() {
	// #ifdef MP-WEIXIN
	return UUID.v4()
	// #endif
	// #ifndef MP-WEIXIN
	return uuid()
	// #endif
}
/**
 * 获取页面id
 * @returns
 */
export function getPageId(pageInstance) {
	const currentPage = pageInstance ?? getHistoryPage()
	// #ifdef MP-WEIXIN
	return currentPage.__wxWebviewId__
	// #endif
	// #ifndef MP-WEIXIN
	return currentPage.$.uid
	// #endif
}

/**
 * @param filename
 * @Explain filename字符串处理,获取文件后缀
 * @Return String
 */
export function getFileSuffix(filename) {
	const pos = filename.lastIndexOf('.')
	let suffix = ''
	if (pos !== -1) {
		suffix = filename.substring(pos)
	}
	return suffix
}

export function base64ToFile(base64String, filename) {
	// 将 base64 字符串分割成两部分：第一部分是数据类型（如：data:image/png;base64,），第二部分是纯数据
	const arr = base64String.split(',')
	const mime = arr[0].match(/:(.*?);/)[1] // 提取 MIME 类型
	const bstr = atob(arr[1]) // 解码 base64 字符串
	let n = bstr.length
	const u8arr = new Uint8Array(n)
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}
	// 创建 Blob 对象
	const blob = new Blob([u8arr], { type: mime })
	// 创建 File 对象
	return new File([blob], filename, { type: mime })
}

export function getExtensionFromBase64(base64) {
	const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
	if (mime && mime.length > 1) {
		switch (mime[1]) {
			case 'image/jpeg':
				return 'jpg'
			case 'image/png':
				return 'png'
			case 'image/gif':
				return 'gif'
			// 可以根据需要添加其他类型
			default:
				return 'png'
		}
	}
	return 'png'
}

export function base64ToFilePath(base64Data) {
	return new Promise((resolve, reject) => {
		// #ifdef H5
		// 在 H5 端，我们转换为 File 对象
		const file = base64ToFile(base64Data, 'image.png')
		resolve(file)
		// #endif

		// #ifndef H5
		// 在小程序端和 App 端，将 base64 写入临时文件
		const fileManager = uni.getFileSystemManager()
		// 生成临时文件路径
		const filePath = `${uni.env.USER_DATA_PATH}/temp_${Date.now()}.png`
		// 将 base64 数据写入文件
		fileManager.writeFile({
			filePath,
			data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
			encoding: 'base64',
			success: () => {
				resolve(filePath)
			},
			fail: (err) => {
				reject(err)
			}
		})
		// #endif
	})
}

/**
 * 安全的执行promise
 * @param {*} promise
 * @returns
 */
export async function safeAwait(promise) {
	try {
		const result = await promise
		return [null, result] // ✅ 第一个是错误，第二个是结果
	} catch (error) {
		return [error, null] // ❌ 出错时返回错误
	}
}

/**
 * 补全oss url文件地址
 * @param {*} url
 * @returns
 */
export function fillOssUrl(url) {
	return validURL(url)
		? url
		: import.meta.env.VITE_UPLOAD_URL + (url.startsWith('/') ? url : '/' + url)
}

/**
 * 获取文件类型
 * @param {*} url
 * @returns
 */
export function getFileTypeByUrl(url) {
	// 去掉参数和 hash
	const cleanUrl = url.split('?')[0].split('#')[0]
	const ext = cleanUrl.split('.').pop().toLowerCase()

	const map = {
		image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
		video: ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'ogg'],
		audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'],
		document: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
		code: ['js', 'ts', 'json', 'html', 'css', 'java', 'c', 'cpp', 'py'],
		zip: ['zip', 'rar', '7z', 'tar', 'gz']
	}

	for (const key in map) {
		if (map[key].includes(ext)) return key // 返回类别
	}

	return ext || 'unknown' // 如果不在表中，则返回扩展名
}

/**
 * 格式化树
 */
export function formatTree(tree, format, childrenKey = 'children') {
	if (!isArray(tree)) {
		return new Error('The parameters can only be arrays or objects!')
	}
	if (!isFunction(format)) {
		return new Error('The parameters can only be function!')
	}
	let list = []
	tree.forEach((node) => {
		let item = format(node)
		let children = node[childrenKey]
		if (!isEmpty(children)) {
			item[childrenKey] = formatTree(children, format, childrenKey)
		}
		list.push(item)
	})
	return list
}

/**
 * 过滤树
 */
export function filterTree(tree, predicate, childrenKey = 'children') {
	let copy = deepClone(tree)
	if (!isArray(tree)) {
		return new Error('The parameters can only be arrays or objects!')
	}
	if (!isFunction(predicate)) {
		return new Error('The parameters can only be function!')
	}
	let list = copy.filter(predicate)
	list.forEach((node) => {
		let children = node[childrenKey]
		if (!isEmpty(children)) {
			node[childrenKey] = filterTree([...children], predicate, childrenKey)
		}
	})
	return list
}

export function formatMs(ms) {
	const d = dayjs.duration(ms)
	return {
		year: d.years(),
		day: d.days(),
		hour: String(d.hours()).padStart(2, '0'),
		minute: String(d.minutes()).padStart(2, '0'),
		second: String(d.seconds()).padStart(2, '0')
	}
}

/**
 * 拼接oss资源域名 固定存放地址
 */
export function fullAssetsOssPath(path) {
	if (!path) return path
	return (
		import.meta.env.VITE_ASSETS_OSS_BASEURL +
		'/scmsv-assets' +
		(path.startsWith('/') ? path : '/' + path)
	)
}
/**
 *  通用的 uni API Promise 化方法
 * @param {*} apiName
 * @returns
 */
export function uniPromisify(apiName) {
	return (options = {}) =>
		new Promise((resolve, reject) => {
			uni[apiName]({
				...options,
				success(res) {
					if (isFunction(options.success)) options.success(res)
					resolve(res)
				},
				fail(err) {
					if (isFunction(options.fail)) options.fail(err)
					reject(err)
				}
			})
		})
}

/**
 * 获取树型深度
 * @param {*} tree
 * @param {*} childKey
 * @returns
 */
export function getTreeDepth(tree, childKey = 'children', start = 1) {
	let max = 0

	function dfs(list, depth) {
		list.forEach((item) => {
			max = Math.max(max, depth)
			const children = item[childKey]
			if (children && children.length) {
				dfs(children, depth + 1)
			}
		})
	}

	dfs(tree, start)
	return max
}
/**
 * 补全上传资源路径
 */
export function fullUploadFilePath(url) {
	if (!url || validURL(url)) {
		return url
	}
	return import.meta.env.VITE_API_BASE_URL + url
}
