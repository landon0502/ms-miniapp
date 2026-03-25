/**
 * 获取oss token
 */
export function fetchOssToken(params) {
	return uni.$uv.http.post('/zl.bs.sc.oss.manage.common.postobjectpolicy.v5/1.0.0/action', params, {
		custom: {
			useMessage: true
		}
	})
}

// 获取详细地址信息
export function getAddressDetail({ latitude, longitude }) {
	return uni.$uv.http.get(
		'https://restapi.amap.com/v3/geocode/regeo',

		{
			params: {
				location: `${longitude},${latitude}`,
				key: import.meta.env.VITE_AMAP_KEY,
				extensions: 'all' // 必须设置该参数以获取详细的行政区划信息
			},
			custom: {
				raw_response: true
			}
		}
	)
}

/**
 * 获取当前运营平台的shopcode
 */
export const fetchCurrentShopCode = () =>
	uni.$uv.http.post('/zl.bs.sc.web.getShopCode.v5/1.0.0/action')
