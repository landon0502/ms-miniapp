<template>
	<PageContainer
		:navBarProps="{
			leftIcon: 'arrow-left',
			bgColor: '#FB6B2F',
			leftIcon: ''
		}"
		:content-style="{ padding: 0 }"
		:custom-style="{ background: '#FFF' }"
	>
		<template #nav-center>
			<view class="flex justify-center items-center">
				<text class="text-white text-center">订单明细</text>
			</view>
		</template>
		<view class="font-sans ">
			<uv-gap height="12px" bgColor="#EFEEF5"/>
			<!-- 订单信息列表 -->
			<view class="px-12px shadow-sm">
				<!-- 订单号 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">订单号</text>
					<text
						class="text-sm font-light flex-2 text-right border border-gray-300   max-w-full break-all text-#444444 text-bold"
						>{{ orderInfo?.detail_list_order_no || '--' }}</text
					>
				</view>
				<uv-line />
				<!-- 港区单号 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">港区单号</text>
					<text
						class="text-sm font-light flex-2 text-right border border-gray-300   max-w-full break-all text-#444444"
						>{{ orderInfo?.route_info?.port_order_no || '--' }}</text
					>
				</view>
				<uv-line />
				<!-- 航线 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">航线</text>
					<text class="text-sm font-light flex-2 text-right text-#444444">{{
						orderInfo?.route_info?.route || '--'
					}}</text>
				</view>
				<uv-line />
				<!-- 开航时间 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">开航时间</text>
					<text
						class="text-sm font-light flex-2 text-right    text-#444444"
						>{{ formatDate(orderInfo?.route_info?.sailing_time) }}</text
					>
				</view>
				<uv-line />
				<!-- 航班代号(航班号) -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">航班代号(航班号)</text>
					<text class="text-sm font-light flex-2 text-right text-#444444"
						>({{ orderInfo?.route_info?.offline_flight || '--' }})</text
					>
				</view>
				<uv-line />
				<!-- 车型 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">车型</text>
					<text class="text-sm font-light flex-2 text-right text-#444444">{{
						orderInfo?.route_info?.vehicle_type || '--'
					}}</text>
				</view>
				<uv-line />
				<!-- 始发港 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">始发港</text>
					<text class="text-sm font-light flex-2 text-right text-#444444">{{
						orderInfo?.route_info?.departure_port || '--'
					}}</text>
				</view>
				<uv-line />
				<!-- 目的港 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">目的港</text>
					<text class="text-sm font-light flex-2 text-right">{{
						orderInfo?.route_info?.destination_port || '--'
					}}</text>
				</view>
				<uv-line />
				<!-- 旅客票价 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">旅客票价</text>
					<text class="text-sm font-light flex-2 text-right text-#444444"
						>{{ (parseFloat(orderInfo?.route_info?.passenger_price) || 0).toFixed(2) }} 元</text
					>
				</view>
				<uv-line />
				<!-- 车辆票价 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">车辆票价</text>
					<text class="text-sm font-light flex-2 text-right text-#444444"
						>{{ (parseFloat(orderInfo?.route_info?.vehicle_price) || 0).toFixed(2) }} 元</text
					>
				</view>
				<uv-line />
				<!-- 增值服务 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">增值服务</text>
					<text class="text-sm font-light flex-2 text-right text-#444444"
						>{{ (parseFloat(orderInfo?.route_info?.value_added_service) || 0).toFixed(2) }} 元</text
					>
				</view>
				<uv-line />
				<!-- 总金额 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">总金额</text>
					<text class="text-sm font-light flex-2 text-right text-#444444"
						>{{ amount }} 元</text
					>
				</view>
				<uv-line />
				<!-- 订票时间 -->
				<view class="flex justify-between items-center py-12px border-b border-gray-100">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">订票时间</text>
					<text
						class="text-sm font-light flex-2 text-righ   text-#444444"
						>{{ formatDate(orderInfo?.route_info?.booking_time) }}</text
					>
				</view>
				<uv-line />
				<!-- 订单状态 -->
				<view class="flex justify-between items-center py-12px">
					<text class="text-gray-600 text-sm font-light flex-1 text-#999999">订单状态</text>
					<text class="text-sm font-light flex-2 text-right text-#444444">{{
						orderInfo?.status || '已支付'
					}}</text>
				</view>
				<uv-line />
				<!-- 订单状态 -->
				<view class="flex justify-between items-center py-12px">
					<text class="text-gray-600 text-sm font-light flex-1"></text>
					<text class="text-sm font-light flex-2 text-right text-#FF181A">下单成功</text>
				</view>
			</view>
		</view>
	</PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer'
import { shallowRef } from 'vue'
import useServices from './useServices'
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
const amount = computed(() => {
	return (
		(parseFloat(orderInfo.value?.route_info?.value_added_service) || 0) +
		(parseFloat(orderInfo.value?.route_info?.vehicle_price) || 0) +
		(parseFloat(orderInfo.value?.route_info?.passenger_price) || 0)
	).toFixed(2)
})
// 格式化时间函数
const formatDate = (dateString) => {
	if (!dateString) return '--'
	return dayjs(dateString).format('YYYY-MM-DD HH:mm')
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
</script>

<style scoped>
/* 已使用 Unocss 类名替换所有样式 */
</style>
