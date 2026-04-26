<template>
	<view class="bg-white rounded-3 px-4 py-2">
		<view class="flex gap-4px items-center mb-4">
			<text class="text-13px text-gray-800">订单号：{{ order.order_no }}</text>
			<uv-icon
				:name="copyLineIcon"
				:size="14"
				@click="
					() => {
						uni.setClipboardData({
							data: order.sub_order_no,
							success: function () {
								console.log('复制成功')
							}
						})
					}
				"
			/>
		</view>
		<view>
			<view>
				<text class="font-size-10px text-#7E7E7E whitespace-nowrap">{{
					order.shipping_store
				}}</text>
				<view class="flex justify-between items-center">
					<view class="flex items-center gap-5px">
						<view class="flex items-center">
							<!-- <uv-icon :name="requireIcon" :size="8" /> -->
							 <view class="w-8rpx h-8rpx rounded-full bg-#BD854F mr-4rpx"></view>
							<text class="font-size-10px text-#7E7E7E whitespace-nowrap">子订单号：</text>
							<text class="font-size-10px text-#7E7E7E whitespace-nowrap">{{
								order.sub_order_no
							}}</text>
						</view>
						<uv-icon
							:name="copyLineIcon"
							:size="12"
							@click="
								() => {
									uni.setClipboardData({
										data: order.sub_order_no,
										success: function () {
											console.log('复制成功')
										}
									})
								}
							"
						/>
						<view
							class="border-1px border-solid border-#D5B69D flex-center px-2px rounded-2px height-20rpx text-8px text-#D5B69D whitespace-nowrap"
							v-if="order.is_port_pickup === 1"
						>
							口岸自提
						</view>
					</view>
					<text class="font-size-12px text-#A6A6A6">{{ getStatusText(order.status) }}</text>
				</view>
			</view>
			<view class="flex flex-col gap-24px py-24px">
				<GoodsItem
					v-for="goods in order.items"
					:key="goods.id"
					:goods="goods"
					@goods-tap="handleClickGoods"
					:image="goods.product.image"
				/>
			</view>
		</view>
		<view class="flex justify-between items-center pt-4">
			<text class="text-base text-gray-600"> </text>
			<view class="flex gap-8px">
				<OrderBtn
					v-for="btn in getOrderButtons(order.status)"
					:key="btn.text"
					:text="btn.text"
					@click="btn.action(order.id)"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import OrderBtn from './OrderBtn.vue'
import GoodsItem from '../GoodsItem'
import copyLineIcon from '@/assets/images/copy-line.png'
import requireIcon from '@/assets/images/require.png'
import router from '@/router'
const props = defineProps({
	order: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['cancelOrder', 'payOrder', 'confirmReceive', 'applyAfterSale'])

const goToDetail = (id) => {
	if (props.order.order_templ === 1) {
		router.to({ url: '/pages/order/duty-free-detail/index', params: { id } })
	} else {
		router.to({ url: '/pages/order/detail/index', params: { id } })
	}
}

const cancelOrder = (id) => {
	emit('cancelOrder', id)
}

const payOrder = (id) => {
	emit('payOrder', id)
}

const confirmReceive = (id) => {
	emit('confirmReceive', id)
}

const applyAfterSale = (id) => {
	emit('applyAfterSale', id)
}

// 订单状态映射
const statusMap = {
	pending: '待支付',
	paid: '已支付',
	shipped: '已发货',
	completed: '已提货',
	cancelled: '已取消',
	refund: '售后中'
}

// 获取状态文本
const getStatusText = (status) => {
	return statusMap[status] || status
}

// 获取订单按钮配置
const getOrderButtons = (status) => {
	const buttons = []
	// 所有状态都添加查看订单按钮
	buttons.push({ text: '查看订单', action: goToDetail })
	// 根据状态添加对应按钮
	switch (status) {
		case 'pending':
			buttons.push(
				{ text: '立即支付', action: payOrder },
				{ text: '取消订单', action: cancelOrder }
			)
			break
		case 'shipped':
			buttons.push({ text: '取消订单', action: cancelOrder })
			break
		case 'completed':
			buttons.push({ text: '申请开票', action: () => {} })
			buttons.push({ text: '查看物流', action: () => {} })
			
			break
	}

	return buttons
}

// 点击商品项
const handleClickGoods = (goods) => {
	router.to({ url: '/pages/goods/detail/index', params: { product_id: goods.product_id } })
}
</script>
