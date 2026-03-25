<template>
	<PageContainer
		:navBarProps="{
			title: '离岛免税订单详情',
			leftIcon: 'arrow-left'
		}"
		fixedContentHeight
		:content-style="{ padding: 0 }"
		:custom-style="{ background: '#f5f5f5' }"
	>
		<ScrollPaging ref="pagingRef" refreshonly>
			<view class="flex flex-col gap-24rpx p-24rpx">
				<!-- 加载状态 -->
				<view v-if="loading" class="flex justify-center items-center py-48rpx">
					<text>加载中...</text>
				</view>

				<!-- 错误状态 -->
				<view v-else-if="error" class="flex justify-center items-center py-48rpx">
					<text class="text-red-500">{{ error }}</text>
				</view>

				<!-- 订单内容 -->
				<template v-else>
					<!-- 订单状态 -->
					<view class="overflow-hidden rounded-8px">
						<uv-gap bgColor="#BD854F" height="5px" />
						<Card
							:showHeader="false"
							:customContentStyle="{ padding: '0' }"
							:customStyle="{ borderRadius: '0', padding: '0' }"
						>
							<template #content>
								<view class="pos-relative">
									<view
										class="flex flex-col justify-center px-12px bg-gradient-to-b from-[#F1E4D8] to-[#FFFFFF] h-150rpx"
									>
										<view class="flex flex-row items-center gap-4px">
											<view class="flex flex-row items-center gap-8px">
												<uv-icon :name="expressPackageFull" :size="16" />
												<text class="font-size-15px text-#C49262">已提货</text>
											</view>
											<uv-icon name="arrow-right" :size="8" color="#8E8E8E" />
										</view>
										<view>
											<text class="font-size-12px text-#A0A0A0">感谢您的购物!</text>
										</view>
									</view>
									<!-- 收货信息 -->
									<view class="px-12px"> <uv-line /></view>
									<view class="p-12px">
										<view class="flex flex-col gap-12px">
											<view class="flex flex-row gap-4px items-center py-4px">
												<text class="font-size-16px text-#5D5D5D font-bold">{{
													orderInfo?.consignee_name || '加载中...'
												}}</text>
												<text class="font-size-12px text-#353535">{{
													orderInfo?.consignee_phone || '加载中...'
												}}</text>
											</view>

											<view class="flex flex-row gap-4px items-center py-4px">
												<uv-icon :name="idcardIcon" :size="14" />
												<text class="font-size-12px text-#353535">{{
													orderInfo?.consignee_idcard || '加载中...'
												}}</text>
											</view>
										</view>
										<view class="flex flex-row gap-12px items-center">
											<view class="flex flex-row gap-4px items-center py-4px">
												<uv-icon :name="briefcaseIcon" :size="14" />
												<text class="font-size-12px text-#353535">离岛时间：</text>
												<text class="font-size-12px text-#353535">
													{{ formatDate(orderInfo?.router_info?.departure_time) }}/
													{{ orderInfo?.router_info?.offline_flight }}
												</text>
											</view>
										</view>
									</view>
									<view
										class="w-24rpx h-24rpx rounded-full bg-#f5f5f5 pos-absolute left-[-12rpx] top-138rpx z-3"
									></view>
									<view
										class="w-24rpx h-24rpx rounded-full bg-#f5f5f5 pos-absolute right-[-12rpx] top-138rpx z-3"
									></view>
								</view>
							</template>
						</Card>
					</view>

					<!-- 订单信息 -->
					<Card :showHeader="false" :customContentStyle="{ padding: '0 24rpx' }">
						<template #content>
							<view>
								<view>
									<view class="flex flex-row items-center py-6px">
										<text class="font-size-12px text-#A2A2A2">订单编号：</text>
										<text class="font-size-12px text-#5D5D5D ml-4px">
											{{ orderInfo?.order_no || '加载中...' }}
										</text>
										<view
											class="font-size-12px rounded-8px text-#333333 bg-#F5F5F5 px-8px py-2px ml-8px"
											@click="
												() => {
													uni.setClipboardData({
														data: orderInfo?.order_no,
														success: function () {
															console.log('复制成功')
														}
													})
												}
											"
										>
											复制
										</view>
									</view>
								</view>
								<view>
									<view class="flex flex-row items-center py-6px">
										<text class="font-size-12px text-#A2A2A2">发货门店：</text>
										<text class="font-size-12px text-#5D5D5D ml-4px"> 海南电商离岛免税 </text>
									</view>
								</view>
								<view>
									<view class="flex flex-row items-center py-6px">
										<text class="font-size-12px text-#A2A2A2">下单时间：</text>
										<text class="font-size-12px text-#5D5D5D ml-4px">
											{{ formatDate(orderInfo?.order_time) }}
										</text>
									</view>
								</view>
								<view>
									<view class="flex flex-row items-center py-6px">
										<text class="font-size-12px text-#A2A2A2">支付方式：</text>
										<text class="font-size-12px text-#5D5D5D ml-4px">
											{{ orderInfo?.payment_method || '大会员积分支付,微信支付' }}
										</text>
									</view>
								</view>
								<view>
									<view class="flex flex-row items-center py-6px">
										<text class="font-size-12px text-#A2A2A2">提货方式：</text>
										<text class="font-size-12px text-#5D5D5D ml-4px">
											{{ orderInfo?.pickup_method || '离岛提货点自提' }}-<text
												class="text-#C49262"
												>{{ orderInfo?.pickup_location || '新海港' }}</text
											>
										</text>
									</view>
								</view>
								<view class="mt-12px">
									<uv-line />
								</view>
								<view class="flex flex-row items-center justify-center pt-12px gap-8px">
									<view>
										<uv-icon :name="serveIcon" :size="24" />
									</view>
									<text class="font-size-14px text-#5D5D5D">联系我们</text>
								</view>
							</view>
						</template>
					</Card>
					<Card title="离岛免税商品列表" :titleBold="false" showHeadLine>
						<template #content>
							<view class="flex flex-col gap-12px">
								<GoodsItem
									class="goods-item"
									v-for="(item, index) in orderInfo?.items || []"
									:key="index"
									:data="item"
								>
								</GoodsItem>
							</view>
						</template>
					</Card>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">申请发票</text>
						<text class="font-size-12px text-#666666">{{ orderInfo?.invoice_status || '否' }}</text>
					</view>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">是否使用优惠券</text>
						<text class="font-size-12px text-#666666">{{ orderInfo?.coupon_status || '是' }}</text>
					</view>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">退货积分补款</text>
						<text class="font-size-12px text-#666666"
							>积分补款金额：￥{{ orderInfo?.points_refund || 0 }}</text
						>
					</view>
					<!-- 价格明细 -->
					<view class="price-detail flex flex-col gap-24rpx">
						<view class="price-row flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px text-#999999">商品总价：</text>
							</view>
							<view class="min-w-140rpx flex justify-end">
								<text class="price-value font-size-12px text-#999999"
									>¥{{ orderInfo?.total_original_price || 0 }}</text
								>
							</view>
						</view>
						<view class="price-row flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px text-#999999">折扣优惠：</text>
							</view>
							<view class="min-w-140rpx flex justify-end">
								<text class="price-value font-size-12px text-#999999">
									-¥{{ orderInfo?.discount || 0 }}
								</text>
							</view>
						</view>
						<view class="price-row flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px text-#999999">积分抵扣：</text>
							</view>
							<view class="min-w-140rpx flex justify-end">
								<text class="price-value font-size-12px text-#999999">
									-¥{{ orderInfo?.points_deduction || 0 }}
								</text>
							</view>
						</view>
						<view class="price-row flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px text-#999999">行邮税：</text>
							</view>
							<view class="min-w-140rpx flex justify-end">
								<text class="price-value font-size-12px text-#999999">
									¥{{ orderInfo?.mail_tax || 0 }}
								</text>
							</view>
						</view>
						<view class="price-row flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px text-#999999">行邮税优惠：</text>
							</view>
							<view class="min-w-140rpx flex justify-end">
								<text class="price-value discount font-size-12px text-#999999">
									-¥{{ orderInfo?.mail_tax_discount || 0 }}
								</text>
							</view>
						</view>
						<view class="price-row total flex flex-row items-center justify-end gap-8px">
							<view class="w-100px flex justify-end">
								<text class="price-label font-size-12px">实付金额：</text>
							</view>

							<view class="min-w-140rpx flex justify-end">
								<text class="price-value total-price font-size-15px">
									¥{{
										(orderInfo?.total_original_price || 0) -
										(orderInfo?.discount || 0) -
										(orderInfo?.points_deduction || 0) +
										(orderInfo?.mail_tax || 0) -
										(orderInfo?.mail_tax_discount || 0)
									}}
								</text>
							</view>
						</view>
					</view>
				</template>
			</view>
		</ScrollPaging>

		<!-- 底部操作 -->
		<template #footer>
			<view class="footer-buttons flex flex-row items-center justify-between px-24px py-12px">
				<uv-button
					type="default"
					class="footer-btn"
					:text="'更多'"
					:custom-text-style="{ color: '#A7A7A7' }"
				></uv-button>
				<uv-button
					class="footer-btn"
					:custom-style="{
						borderRadius: '100px',
						border: '0',
						padding: '12px 24px',
						background: '#CA9B6E'
					}"
					:custom-text-style="{
						fontSize: '14px',
						color: '#fff'
					}"
					:text="'再次购买'"
				></uv-button>
			</view>
		</template>
	</PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer'
import { shallowRef } from 'vue'
import Card from '@/components/Card'
import serveIcon from '@/assets/images/serve-icon.png'
import idcardIcon from '@/assets/images/id-card-o.png'
import briefcaseIcon from '@/assets/images/briefcase-icon.png'
import expressPackageFull from '@/assets/images/express-package-full.png'
import GoodsItem from './components/GoodsItem.vue'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import useServices from '../useServices'
import dayjs from 'dayjs'
// 微信小程序的 onLoad 生命周期
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from '@/composables'

// 使用 useRouter
const { params } = useRouter()

// 使用 useServices
const { orderDetailControl } = useServices()

// 从 orderDetailControl 中解构出属性，确保响应式
const { data: orderInfo, loading, error } = orderDetailControl

// 格式化时间函数
const formatDate = (dateString) => {
	if (!dateString) return '加载中...'
	return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化订单状态
const formatStatus = (status) => {
	const statusMap = {
		pending: '待支付',
		paid: '已支付',
		shipped: '已发货',
		completed: '已完成',
		cancelled: '已取消',
		refund: '售后中'
	}
	return statusMap[status] || status
}

const pagingRef = shallowRef(null)

// 微信小程序的 onLoad 生命周期
onLoad(() => {
	// options 中包含路由参数
	orderDetailControl.run({ id: params.value.id })
})

useScrollPaging(pagingRef, {
	async onRefresh() {
		// 使用 params.value.id 刷新数据
		await orderDetailControl.run({ id: params.value.id })
	}
})
</script>
