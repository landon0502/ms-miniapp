/**
 * @desc 购物车相关逻辑
 * @createTime 2025/11/15 09:16
 */

/**
 * 加入购物车
 * @param {*} params
 * @returns
 */
export const addGoodsCart = (params) =>
	uni.$uv.http.post('/zl.bs.sc.xcx.cart.add.v5/1.0.0/action', params)
