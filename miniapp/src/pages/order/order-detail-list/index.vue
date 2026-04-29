<template>
	<PageContainer
		:navBarProps="{
			leftIcon: 'close',
			leftIconColor: '#000',
			bgColor: '#fff'
		}"
		:content-style="{ padding: 0 }"
		:custom-style="{ background: '#FFF' }"
		footerFixed
		:safeAreaInsetBottom="false"
		fixedContentHeight
	>
		<template #nav-center>
			<view class="flex justify-center items-center">
				<view class="flex flex-col items-center">
					<text class="text-#333 text-center text-14px">琼州海峡轮渡管家</text>
					<text class="text-#333 text-center text-10px">hxwx.digitalstrait.cn</text>
				</view>
			</view>
		</template>
		<template #top-extra>
			<uv-navbar
				title="订单明细"
				:safeAreaInsetTop="false"
				bgColor="#FB6B2F"
				:fixed="false"
				:leftIcon="''"
				titleStyle="color:#fff"
			/>
		</template>
		<ScrollPaging :refresherEnabled="false" :loadmoreEnable="false" emptyDisabled>
			<view class="font-sans">
				<uv-gap height="12px" bgColor="#EFEEF5" />
				<!-- 订单信息列表 -->
				<view class="px-12px shadow-sm">
					<!-- 订单号 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">订单号</text>
						<text
							class="text-sm flex-2 text-right border border-gray-300 max-w-full break-all text-#666 font-400"
						>
							{{ orderInfo?.detail_list_order_no || '--' }}
						</text>
					</view>
					<uv-line />
					<!-- 港区单号 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">港区单号</text>
						<text
							class="text-sm flex-2 text-right border border-gray-300 max-w-full break-all text-#666 font-400"
						>
							{{ orderInfo?.route_info?.port_order_no || '--' }}
						</text>
					</view>
					<uv-line />
					<!-- 航线 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">航线</text>
						<text class="text-sm  flex-2 text-right text-#666 font-400">{{
							orderInfo?.route_info?.route || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 开航时间 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">开航时间</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">{{
							formatDate(orderInfo?.route_info?.sailing_time) || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 航班代号(航班号) -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777"
							>航班代号(航班号)</text
						>
						<text class="text-sm flex-2 text-right text-#666 font-400">
							({{ orderInfo?.route_info?.offline_flight || '--' }})
						</text>
					</view>
					<uv-line />
					<!-- 车型 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">车型</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">{{
							orderInfo?.route_info?.vehicle_type || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 始发港 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">始发港</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">{{
							orderInfo?.route_info?.departure_port || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 目的港 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">目的港</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">{{
							orderInfo?.route_info?.destination_port || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 旅客票价 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">旅客票价</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">
							{{ (parseFloat(orderInfo?.route_info?.passenger_price) || 0).toFixed(2) }} 元
						</text>
					</view>
					<uv-line />
					<!-- 车辆票价 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">车辆票价</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">
							{{ (parseFloat(orderInfo?.route_info?.vehicle_price) || 0).toFixed(2) }} 元
						</text>
					</view>
					<uv-line />
					<!-- 增值服务 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">增值服务</text>
						<text class="text-sm flex-2 text-right text-#666 font-400"
							>{{
								(parseFloat(orderInfo?.route_info?.value_added_service) || 0).toFixed(2)
							}}
							元</text
						>
					</view>
					<uv-line />
					<!-- 总金额 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">总金额</text>
						<text class="text-sm flex-2 text-right text-#666 font-400"
							>{{ amount }} 元</text
						>
					</view>
					<uv-line />
					<!-- 订票时间 -->
					<view class="flex justify-between items-center py-12px border-b border-gray-100">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">订票时间</text>
						<text class="text-sm flex-2 text-righ text-#666 font-400">{{
							formatDate(orderInfo?.route_info?.booking_time) || '--'
						}}</text>
					</view>
					<uv-line />
					<!-- 订单状态 -->
					<view class="flex justify-between items-center py-12px">
						<text class="text-gray-600 text-sm font-light flex-1 text-#777777">订单状态</text>
						<text class="text-sm flex-2 text-right text-#666 font-400">{{
							orderInfo?.status || '已支付'
						}}</text>
					</view>
					<uv-line />
					<!-- 订单状态 -->
					<view class="flex justify-between items-center py-12px">
						<text class="text-gray-600 text-sm font-light flex-1"></text>
						<text class="text-sm flex-2 text-right text-#FF181A">下单成功</text>
					</view>
				</view>
			</view>
		</ScrollPaging>
		<template #footer>
			<view class="w-full bg-#fff">
				<uv-line />
				<view class="h-54px px-24rpx box-border flex items-center justify-center">
					<view class="flex flex-row items-center justify-center gap-200rpx">
						<view @click="router.back()">
							<uv-icon name="arrow-left" :size="26" :color="'#333'" />
						</view>
						<view class="opacity-50">
							<uv-icon name="arrow-right" :size="26" :color="'#333'" />
						</view>
					</view>
				</view>
				<uv-safe-bottom></uv-safe-bottom>
			</view>
		</template>
	</PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer'
import { shallowRef, computed } from 'vue'
import useServices from './useServices'
import dayjs from 'dayjs'
// 微信小程序的 onLoad 生命周期
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from '@/composables'
import ScrollPaging from '@/components/ScrollPaging'
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
const amount = computed(() => {
	return (
		(parseFloat(orderInfo.value?.route_info?.value_added_service) || 0) +
		(parseFloat(orderInfo.value?.route_info?.vehicle_price) || 0) +
		(parseFloat(orderInfo.value?.route_info?.passenger_price) || 0)
	).toFixed(2)
})
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
</script>

<style scoped>
/* 已使用 Unocss 类名替换所有样式 */
</style>
