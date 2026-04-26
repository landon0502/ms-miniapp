<template>
	<PageContainer
		:navBarProps="{
			title: '已提货',
			leftIcon: 'arrow-left'
		}"
		fixedContentHeight
		:content-style="{ padding: 0 }"
		:custom-style="{ background: '#f5f5f5' }"
	>
		<ScrollPaging ref="pagingRef" refreshonly>
			<view class="flex flex-col gap-24rpx p-24rpx">
				<!-- 订单内容 -->
				<template v-if="orderInfo">
					<!-- 订单状态 -->
					<Card :showHeader="false" :customContentStyle="{ padding: '12rpx 24rpx' }">
						<template #content>
							<view>
								<view class="flex flex-row justify-between items-center">
									<view class="flex flex-row items-center gap-8px">
										<uv-icon :name="articleIcon" :size="14" />
										<text class="font-size-15px text-#333333">已提货</text>
									</view>
									<uv-icon name="arrow-right" :size="14" :color="'#8E8E8E'" />
								</view>
								<view class="p-l-22px mt-12px">
									<text class="font-size-12px text-#999999">已提货</text>
								</view>
							</view>
						</template>
					</Card>

					<!-- 收货信息 -->
					<Card :showHeader="false">
						<template #content>
							<view>
								<view class="flex flex-row gap-12px items-center flex-wrap">
									<view class="flex flex-row gap-4px items-center py-4px">
										<uv-icon :name="locationIcon" :size="18" />
										<text class="font-size-14px text-#5D5D5D font-bold">{{
											orderInfo?.consignee_name || '--'
										}}</text>
									</view>
									<view class="flex flex-row gap-4px items-center py-4px">
										<uv-icon :name="phoneIcon" :size="14" />
										<text class="font-size-14px text-#9E9E9E">{{
											orderInfo?.consignee_phone || '--'
										}}</text>
									</view>
									<view class="flex flex-row gap-4px items-center py-4px">
										<uv-icon :name="idcardIcon" :size="14" />
										<text class="font-size-14px text-#9E9E9E">{{
											orderInfo?.consignee_idcard || '--'
										}}</text>
									</view>
								</view>
								<view class="flex flex-row gap-12px items-center flex-wrap pl-18px">
									<view class="flex flex-row gap-4px items-center py-4px">
										<uv-icon :name="steamerIcon" :size="14" />
										<text class="font-size-14px text-#9E9E9E">{{
											orderInfo?.route_info?.offline_flight || '--'
										}}</text>
									</view>
									<view class="flex flex-row gap-4px items-center py-4px">
										<uv-icon :name="timeIcon" :size="14" />
										<text class="font-size-14px text-#9E9E9E">{{
											formatDate(orderInfo?.route_info?.sailing_time)
										}}</text>
									</view>
								</view>
								<view class="flex flex-row gap-12px items-center pl-18px">
									<view class="flex flex-row gap-4px items-start py-4px">
										<view class="flex flex-row items-center gap-4px">
											<uv-icon :name="shAdr" :size="14" :color="'#9E9E9E'" />
											<text class="font-size-12px text-#9E9E9E whitespace-nowrap">自提地址：</text>
										</view>
										<text class="font-size-12px text-#9E9E9E tracking-[1rpx]">
											{{ orderInfo?.pickup_address || '--' }}
										</text>
									</view>
								</view>
								<view class="p-l-22px mt-12px">
									<text class="font-size-12px text-#B7131B">已变更</text>
								</view>
							</view>
						</template>
					</Card>

					<!-- 订单信息 -->
					<Card :showHeader="false" :customContentStyle="{ padding: '0 24rpx' }">
						<template #content>
							<view>
								<view>
									<view class="flex flex-row items-center py-10px">
										<text class="font-size-14px text-#A2A2A2 whitespace-nowrap">订单编号：</text>
										<text class="font-size-12px text-#5D5D5D font-bold ml-4px">
											{{ orderInfo?.order_no || '--' }}
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
									<uv-line />
								</view>
								<view>
									<view class="flex flex-row items-center py-10px">
										<text class="font-size-14px text-#A2A2A2 whitespace-nowrap">下单时间：</text>
										<text class="font-size-12px text-#5D5D5D font-bold ml-4px">
											{{ formatDate(orderInfo?.order_time) }}
										</text>
									</view>
									<uv-line />
								</view>
								<view>
									<view class="flex flex-row items-center py-10px">
										<text class="font-size-14px text-#A2A2A2 whitespace-nowrap">支付方式：</text>
										<text class="font-size-12px text-#5D5D5D font-bold ml-4px">
											大会员积分支付,微信支付
										</text>
									</view>
									<uv-line />
								</view>
								<view>
									<view class="flex flex-row items-center py-10px">
										<text class="font-size-14px text-#A2A2A2 whitespace-nowrap">提货方式：</text>
										<text class="font-size-12px text-#5D5D5D font-bold ml-4px">
											{{ orderInfo?.pickup_method || '口岸自提' }}
										</text>
									</view>
									<uv-line />
								</view>
								<view class="flex flex-row items-center justify-center pt-12px gap-2px">
									<view>
										<uv-icon :name="serveIcon" :size="28" />
									</view>
									<text class="font-size-12px text-#333333">联系我们</text>
								</view>
							</view>
						</template>
					</Card>
					<Card title="离岛自提商品列表" :titleSize="16" :titleBold="false" showHeadLine>
						<template #content>
							<view class="flex flex-col gap-12px">
								<view
									v-for="(item, index) in orderInfo?.items || []"
									:key="index"
									@click="handleClickGoods(item)"
								>
									<GoodsItem class="goods-item" :data="item" :image="item.image" />
								</view>
							</view>
						</template>
					</Card>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">申请发票</text>
						<text class="font-size-12px text-#666666">否</text>
					</view>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">是否使用优惠券</text>
						<text class="font-size-12px text-#666666">是</text>
					</view>
					<view
						class="flex flex-row items-center justify-between py-14px px-12px rounded-8px bg-white"
					>
						<text class="font-size-15px">退货积分补款</text>
						<text class="font-size-12px text-#666666">积分补款金额：￥0</text>
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
								<text class="price-value total-price font-size-15px"> ¥{{ paytotal }} </text>
							</view>
						</view>
					</view>
				</template>
			</view>
		</ScrollPaging>

		<!-- 底部操作 -->
		<template #footer>
			<uv-line />
			<view class="footer-buttons flex flex-row items-center justify-between px-24px py-12px">
				<view @click="handleClickOrderDetail">
					<text class="text-12px text-#999">更多</text>
				</view>
				<uv-button
					class="footer-btn"
					:custom-style="{
						borderRadius: '100px',
						border: '0',
						padding: '12px 24px',
						background: '#CA9B6E'
					}"
					:custom-text-style="{
						fontSize: '12px',
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
import { computed, shallowRef } from 'vue'
import Card from '@/components/Card'
import articleIcon from '@/assets/images/article-icon.png'
import locationIcon from '@/assets/images/location.png'
import serveIcon from '@/assets/images/red-server.png'
import phoneIcon from '@/assets/images/phone-icon.png'
import idcardIcon from '@/assets/images/id-card-o.png'
import steamerIcon from '@/assets/images/steamer-icon.png'
import shAdr from '@/assets/images/sh-adr.png'
import timeIcon from '@/assets/images/time-icon.png'
import GoodsItem from './components/GoodsItem'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import useServices from '../useServices'
import dayjs from 'dayjs'
// 微信小程序的 onLoad 生命周期
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from '@/composables'
import Decimal from 'decimal.js'

// 使用 useRouter
const { params, router } = useRouter()

// 使用 useServices
const { orderDetailControl } = useServices()

// 从 orderDetailControl 中解构出属性，确保响应式
const { data: orderInfo, loading, error } = orderDetailControl

// 格式化时间函数
const formatDate = (dateString) => {
	if (!dateString) return '--'
	return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

const pagingRef = shallowRef(null)

const paytotal = computed(() => {
	if (!orderInfo.value) return 0
	return new Decimal(orderInfo.value.total_original_price)
		.minus(orderInfo.value.discount)
		.minus(orderInfo.value.points_deduction)
		.plus(orderInfo.value.mail_tax)
		.minus(orderInfo.value.mail_tax_discount)
		.toFixed(2)
})

// 微信小程序的 onLoad 生命周期
onLoad((options) => {
	// options 中包含路由参数
	const orderId = options.id || params.value.id || 1
	orderDetailControl.run({ id: orderId })
})

useScrollPaging(pagingRef, {
	async onRefresh() {
		// 使用 params.value.id 刷新数据
		await orderDetailControl.run({ id: params.value.id })
	}
})

// 点击商品项
const handleClickGoods = (goods) => {
	router.to({ url: '/pages/goods/detail/index', params: { product_id: goods.product_id } })
}

const handleClickOrderDetail = () => {
	router.to({
		url: '/pages/order/order-detail-list/index',
		params: {
			id: params.value.id
		}
	})
}
</script>

<style scoped lang="scss">
// 全局样式
page {
	background-color: #f5f5f5;
}
</style>
