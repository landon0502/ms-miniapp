<template>
	<page-meta page-style="overflow:hidden" />
	<PageContainer
		:navBarProps="{
			title: '',
			leftIcon: '',
			avoidMenuButton: true,
			autoBack: false
		}"
		:content-style="{ padding: 0 }"
		topExtraSticky
		fixedContentHeight
		:use-skeletons="true"
	>
		<template #nav-left>
			<view
				class="justify-start flex-shrink-0 ml-[-11px] box-border px-24rpx flex flex-row items-center gap-12px"
				:style="{ width: addUnit(screen.windowWidth - screen.menuBtnRect.width, 'px') }"
			>
				<view>
					<uv-icon name="arrow-left" :size="20" />
				</view>
				<view class="w-full flex-1 overflow-hidden" :style="{height: addUnit(screen.menuBtnRect.height || 44, 'px'),}">
					<Tabs
						:list="[
							{ name: '会员优选', value: '1' },
							{ name: '离岛免税', value: '2' },
							{ name: '线下门店', value: '3' },
							{ name: '出境免税', value: '4' },
							{ name: '旅行服务', value: '5' }
						]"
						key-value="value"
						:custom-style="{ background: 'transparent' }"
						:active-style="{
							fontWeight: 'bold',
							fontSize: '14px',
							color: 'var(--uv-text-color)'
						}"
						:inactive-style="{
							fontSize: '14px'
						}"
						:itemStyle="{
							// alignItems: 'flex-end',
							height: addUnit(screen.menuBtnRect.height || 44, 'px'),
							width: '120rpx',
							padding: '0 8rpx'
						}"
						lineWidth="40rpx"
						lineHeight="16rpx"
						:show-more-btn="false"
						:lineColor="`url(${lineBg}) 100% 100%`"
						:modelValue="current"
					/>
				</view>
			</view>
		</template>
		<template #top-extra>
			<Tabs
				:list="tabsList"
				:item-style="{ height: '44px' }"
				:inactive-style="{
					'white-space': 'nowrap',
					color: 'var(--uv-text-color)',
					fontSize: '13px'
				}"
				:active-style="{
					'white-space': 'nowrap',
					color: '#C59566',
					fontWeight: '400',
					fontSize: '13px'
				}"
				:line-height="3"
				:line-color="'#C59566'"
				:custom-style="{ background: '#FFFFFF' }"
				key-value="value"
				v-model="activeTab"
				@change="onTabChange"
				:scrollable="false"
			/>
		</template>
		<ScrollPaging ref="pageRef">
			<view class="flex flex-col gap-12px px-8px py-12px">
				<OrderItem
					v-for="order in orderList"
					:key="order.id"
					:order="order"
					@cancelOrder="cancelOrder"
					@payOrder="payOrder"
					@confirmReceive="confirmReceive"
					@applyAfterSale="applyAfterSale"
				/>
			</view>
		</ScrollPaging>
	</PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import PageContainer from '@/components/PageContainer'
import Tabs from '@/components/Tabs'
import OrderItem from '@/pages/order/components/OrderItem'
import usePageContext from '@/components/PageContainer/usePageContext'
import { useScreenInfo } from '@/composables'
import { onLoad } from '@dcloudio/uni-app'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import useServices from '@/pages/order/useServices'
import skeletonsConfig from './skeletons'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function'
import {lineBg} from './context'

const { skeletons } = usePageContext()
const screen = useScreenInfo()
const { ordersListControl } = useServices()

const pageRef = ref(null)
const activeTab = ref('all')
const current = ref('2')

const { pagedData: orderList, noMoreData } = ordersListControl
const tabsList = ref([
	{ name: '全部', value: 'all' },
	{ name: '待付款', value: 'pending' },
	{ name: '待发货', value: 'paid' },
	{ name: '待收货', value: 'shipped' },
	{ name: '退款/售后', value: 'refund' }
])

const { complete } = useScrollPaging(pageRef, {
	notMore: noMoreData,
	data: orderList,
	async onRefresh() {
		await loadOrderList()
	},
	async onLoadMore() {
		await ordersListControl.nextPage()
	}
})

const onTabChange = () => {
	loadOrderList(true)
}

skeletons.show(skeletonsConfig)
const loadOrderList = async () => {
	try {
		await ordersListControl.run(
			{
				status: activeTab.value
			},
			{
				pagingParams: {
					page: 1,
					pageSize: 20
				}
			}
		)
		complete(orderList.value, { notMore: noMoreData.value })
	} finally {
		skeletons.hide()
	}
}

const cancelOrder = (id) => {
	uni.showToast({ title: '取消订单', icon: 'none' })
}

const payOrder = (id) => {
	uni.showToast({ title: '立即付款', icon: 'none' })
}

const confirmReceive = (id) => {
	uni.showToast({ title: '确认收货', icon: 'none' })
}

const applyAfterSale = (id) => {
	uni.showToast({ title: '申请售后', icon: 'none' })
}

onLoad(() => {
	const query = uni.getLaunchOptionsSync().query
	if (query && query.type) {
		activeTab.value = query.type
	}
	loadOrderList(true)
})
</script>
