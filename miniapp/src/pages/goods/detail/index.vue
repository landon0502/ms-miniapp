<template>
	<page-meta page-style="overflow:hidden" />
	<PageContainer
		:navBarProps="{
			title: '商品详情',
			leftIcon: 'arrow-left',
			rightIcon: 'more'
		}"
		:content-style="{ padding: 0 }"
		fixedContentHeight
		:footer="productInfo && !loading"
	>
		<ScrollPaging ref="pagingRef" refreshonly>
			<!-- 商品内容 -->
			<template v-if="productInfo && !loading">
				<view class="main-image-section pos-relative">
					<swiper class="h-[600rpx] w-full" circular>
						<swiper-item v-for="(img, index) in imageList" :key="index">
							<uv-image :src="img" mode="aspectFill" width="750rpx" height="600rpx" />
						</swiper-item>
					</swiper>
					<view
						class="w-110rpx pos-absolute z-2 right-24rpx top-200rpx bg-#343233 border-2rpx border-#343233 border-solid rounded-6px overflow-hidden"
					>
						<view class="w-full rounded-6px overflow-hidden bg-#fff">
							<view v-for="(item, index) in productInfo?.promotions" class="w-110rpx h-110rpx">
								<uv-image
									:src="fullUploadFilePath(item.image)"
									:width="'110rpx'"
									:height="'110rpx'"
								/>
								<uv-line v-if="productInfo?.promotions?.length > index + 1" />
							</view>
						</view>
						<view
							class="w-full flex flex-row items-center justify-center py-6rpx"
							@click="promotionRef.open(productInfo, currentSku)"
						>
							<text class="text-10px text-#fff">赠品规则</text>
							<uv-icon name="arrow-right" :size="8" color="#fff" />
						</view>
					</view>
				</view>

				<view
					class="flex items-center p-[18rpx_12rpx] bg-white gap-24rpx"
					v-if="skuList.length > 1"
				>
					<view class="px-16rpx">
						<text class="text-[24rpx]">
							{{ { capacity: '计量', spec: '规格' }[productInfo?.measurement_type] }}
						</text>
					</view>
					<uv-line direction="col" length="100rpx" color="#DADADA"></uv-line>
					<view class="flex-1 overflow-hidden mt-[-10rpx]">
						<scroll-view scroll-x hibe-scrollbar :show-scrollbar="false">
							<view class="flex gap-[16rpx] pt-10rpx">
								<view
									v-for="(sku, index) in skuList"
									:key="index"
									class="w-[100rpx] h-[100rpx] border-[4rpx] border-transparent position-relative box-border flex-shrink-0 opacity-50"
									:class="{ 'sku-active': currentIndex === index }"
									@click="currentIndex = index"
								>
									<uv-image
										:src="sku.images[0] || ''"
										mode="aspectFill"
										class="w-full h-full"
										width="100%"
										height="100%"
									/>
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
				<view
					class="box-border px-32rpx w-full h-120rpx bg-gradient-to-r from-[#B8151B] via-#DD3B38 to-[#B8151B] flex flex-row items-center justify-between"
					v-if="currentSku.activities"
				>
					<view>
						<text class="text-12px text-#fff">活动价</text>
						<view>
							<PriceText
								:value="currentSku.activities.activity_price"
								:text-color="'#fff'"
								:decimalsStyle="{ fontSize: '16px' }"
							>
								<template #suffix>
									<text class="text-#fff text-10px ml-12rpx inline-block line-through"
										>￥{{ currentSku.price }}</text
									>
								</template>
							</PriceText>
						</view>
					</view>
					<view>
						<view class="flex flex-row items-end justify-end gap-24rpx">
							<view class="mb-[-4rpx]">
								<uv-icon :name="msIcon" :size="26" />
							</view>
							<view class="flex flex-col w-160rpx">
								<text class="text-10px text-#fff">距结束还剩</text>
								<text class="text-14px text-#fff font-bold">{{ payCountDownTime }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="w-full box-border p-12rpx flex flex-col gap-24rpx">
					<Card
						:customContentStyle="{ padding: 0 }"
						:customStyle="{
							gap: 0,
							padding: !currentSku.activities ? '12rpx 0 0' : 0,
							background: !currentSku.activities && productInfo?.theme === 'black' ? '#000' : '#fff'
						}"
						:showHeader="!currentSku.activities"
					>
						<template #title>
							<view class="flex flex-row items-center gap-12rpx">
								<PriceText
									:prefixStyle="{ fontSize: '14px' }"
									:decimalsStyle="{ fontSize: '14px' }"
									:value="currentSku?.price"
									textSize="large"
									:textColor="productInfo?.theme === 'black' ? '#fff' : '#B6161C'"
								/>
								<view
									class="pr-8rpx pl-12rpx rounded-full bg-#B6161C flex items-center justify-center"
									v-if="!isUndef(discountPrice)"
									:style="{
										background: productInfo?.theme === 'black' ? '#fff' : '#B6161C'
									}"
								>
									<PriceText
										:value="discountPrice"
										:prefixStyle="{ fontSize: '14px' }"
										:integerStyle="{ fontSize: '14px' }"
										:decimalsStyle="{ fontSize: '14px' }"
										:textColor="productInfo?.theme === 'black' ? '#000' : '#FFF'"
									>
										<template #prefix>
											<text
												class="font-size-10px color-[#fff]"
												:style="{
													color: productInfo?.theme === 'black' ? '#000' : '#FFF'
												}"
												>预估到价</text
											>
										</template>
									</PriceText>
									<view class="pt-2px">
										<uv-icon name="arrow-right" color="#fff" :size="10" />
									</view>
								</view>
							</view>
						</template>
						<template #content>
							<view
								class="p-24rpx mt-[16rpx] bg-white flex flex-col gap-8rpx rounded-18rpx"
								:style="{
									paddingTop: productInfo?.theme === 'black' ? '24rpx' : 0
								}"
							>
								<view
									class="flex flex-row items-start justify-between"
									v-if="!isEmpty(productInfo?.tags)"
								>
									<view class="flex flex-row items-center gap-12rpx flex-1">
										<uv-tags
											v-for="label in productInfo?.tags"
											:key="label"
											:text="label"
											bgColor="#FFF5F8"
											:color="productInfo?.theme === 'black' ? '#000' : '#B6161C'"
											borderColor="transparent"
											size="mini"
										></uv-tags>
									</view>
									<view
										class="flex items-center justify-between gap-6rpx px-4px py-2px rounded-full h-32rpx"
										v-if="!isEmpty(productInfo.coupons)"
										@click="promotionRef.open(productInfo, currentSku)"
										:style="{
											background: productInfo?.theme === 'black' ? '#000' : '#fff'
										}"
									>
										<text
											class="text-[10px] text-#B6161C"
											:style="{
												color: productInfo?.theme === 'black' ? '#fff' : '#B6161C'
											}"
											>领券</text
										>
										<view class="flex flex-center w-24rpx h-24rpx rounded-full bg-#fff">
											<uv-icon
												name="arrow-right"
												:size="8"
												:color="productInfo?.theme === 'black' ? '#000' : '#B6161C'"
											/>
										</view>
									</view>
								</view>
								<view>
									<text class="text-[12px] text-#2F2F2F">
										<view
											class="py-2px px-4px text-[12px] text-#fff inline-block bg-#AC8B6A rounded-4rpx"
										>
											离岛免税
										</view>
										来海南，买免税。凭离岛机票/火车票/船票购买
									</text>
								</view>
								<view>
									<text class="text-16px">{{ productInfo?.name }}</text>
								</view>
								<view>
									<text class="text-12px text-#A4A4A4">{{ currentSku?.sku_name }}</text>
								</view>
							</view>
						</template>
					</Card>

					<!-- 促销 -->
					<Card :showHeader="false">
						<template #content>
							<view class="flex flex-row gap-32rpx">
								<text class="text-13px font-500">促销</text>
								<view class="flex-1 flex flex-col gap-18rpx">
									<view
										v-if="!isEmpty(productInfo?.discounts)"
										class="flex flex-row gap-12rpx items-cener"
									>
										<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
											<text class="text-#B6161C text-10px">
												{{ productInfo.discounts.value + '折' }}
											</text>
										</view>
										<view class="flex-1 flex items-center">
											<text class="text-10px line-clamp-1"
												>此商品专享{{ productInfo.discounts.value }}折</text
											>
										</view>
									</view>
									<view
										v-for="promotion in productInfo?.promotions"
										:key="promotion.id"
										class="flex flex-row gap-12rpx items-cener"
									>
										<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
											<text class="text-#B6161C text-10px">赠品</text>
										</view>
										<view class="flex-1 flex items-center">
											<text class="text-10px line-clamp-1">{{ promotion?.name }}</text>
										</view>
									</view>
									<view
										v-if="!isEmpty(productInfo?.coupons)"
										class="flex flex-row gap-12rpx items-cener"
									>
										<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
											<text class="text-#B6161C text-10px"> 领券 </text>
										</view>
										<view class="flex-1 flex flex-wrap gap-4px">
											<view
												class="coupons-item pos-relative border-2rpx border-solid border-#B6161C flex-center px-4px py-2px rounded-3px"
												v-for="coupon in productInfo.coupons"
												:key="coupon.id"
											>
												<text class="text-10px text-#B6161C">{{ coupon.label }}</text>
											</view>
										</view>
									</view>
								</view>
								<view @click="promotionRef.open(productInfo, currentSku)">
									<uv-icon :name="moreIcon" :size="16" />
								</view>
							</view>
						</template>
					</Card>
					<view
						v-if="productInfo?.detail_description"
						class="w-full bg-#fff goods-desc rounded-16rpx overflow-hidden"
					>
						<uv-parse :content="productInfo.detail_description"></uv-parse>
					</view>
				</view>
			</template>
		</ScrollPaging>
		<template #footer>
			<uv-line />
			<view class="flex items-center px-12rpx py-12rpx h-44px">
				<template v-if="productInfo && !loading">
					<view class="flex gap-[12rpx] mr-[24rpx]">
						<view class="flex flex-col items-center gap-[4rpx] w-60rpx flex-shrink-0">
							<uv-icon :name="homeIcon" :size="18" />
							<text class="text-[20rpx] text-[#333]">首页</text>
						</view>
						<view class="flex flex-col items-center gap-[4rpx] w-60rpx flex-shrink-0">
							<uv-icon :name="aixinIcon" :size="18" />
							<text class="text-[20rpx] text-[#333]">收藏</text>
						</view>
						<view class="flex flex-col items-center gap-[4rpx] w-60rpx flex-shrink-0">
							<uv-icon :name="gouwudaiIcon" :size="18" />
							<text class="text-[20rpx] text-[#333]">购物袋</text>
						</view>
					</view>
					<view
						class="flex flex-row items-center flex-shrink-0 gap-12rpx flex-1 justify-center"
						v-if="productInfo && !loading"
					>
						<view
							class="flex-1 h-[70rpx] leading-[70rpx] text-center text-12px rounded-full border-2rpx border-solid border-#EEEEEE bg-#EEEEEE"
							:style="{
								backgroundColor: productInfo?.theme === 'black' ? '#fff' : '#EEEEEE',
								borderColor: productInfo?.theme === 'black' ? '#000' : '#EEEEEE'
							}"
						>
							加入购物袋
						</view>
						<view
							class="flex-1 h-[70rpx] leading-[70rpx] text-center text-12px rounded-full border-2rpx border-solid border-#B6161C bg-#B6161C text-#fff"
							:style="{
								backgroundColor: productInfo?.theme === 'black' ? '#000' : '#B6161C',
								borderColor: productInfo?.theme === 'black' ? '#000' : '#B6161C'
							}"
						>
							立即购买
						</view>
					</view>
				</template>
			</view>
		</template>
		<template #page-extra>
			<Promotion ref="promotionRef" />
		</template>
	</PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer'
import { ref, computed, shallowRef, nextTick } from 'vue'
import { useMergeModelValue, useRouter, useCountdown } from '@/composables'
import useServices from '../useServices'
import { onLoad } from '@dcloudio/uni-app'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import Card from '@/components/Card'
import PriceText from '@/components/PriceText'
import { isUndef } from '@/utils/is'
import { isEmpty } from 'lodash'
import moreIcon from '@/assets/images/more.png'
import homeIcon from '@/assets/images/home.png'
import gouwudaiIcon from '@/assets/images/gouwudai.png'
import aixinIcon from '@/assets/images/aixin.png'
import { fullUploadFilePath, formatMs } from '@/utils/utils'
import Promotion from '../components/Promotion'
import msIcon from '@/assets/images/ms.png'
import dayjs from 'dayjs'

const { params } = useRouter()
/**
 * 组件实例
 */
const pagingRef = shallowRef()
const promotionRef = shallowRef()
const { start, remaining } = useCountdown()
/**
 * 变量声明
 */
const currentIndex = ref(0)
const theme = ref('red')

// 使用 useServices
const { goodsDetailControl } = useServices()

// 从 goodsDetailControl 中解构出属性，确保响应式
const { data: productInfo, loading, error } = goodsDetailControl

const skuList = computed(() => productInfo.value?.skus || [])
const currentSku = useMergeModelValue(() => skuList.value[currentIndex.value])
const imageList = computed(() => currentSku.value?.images ?? [])

/**
 * 优惠价格
 */
const discountPrice = computed(() => {
	if (productInfo.value?.discounts) {
		return (productInfo.value?.discounts?.value * (currentSku.value?.price || 0)) / 10
	}
	return null
})

// 支付倒计时
const payCountDownTime = computed(() => {
	const { day, hour, minute, second } = formatMs(remaining.value * 1000)
	return [day * 24 + hour, minute, second].join(':')
})

const { load } = useScrollPaging(pagingRef, {
	async onLoad() {
		await goodsDetailControl.run({ id: params.value.product_id })
		await nextTick()
		console.log(currentSku.value)
		if (currentSku.value?.activities) {
			console.log(dayjs(currentSku.value.activities.end_time).diff(Date.now(), 's'))
			start(dayjs(currentSku.value.activities.end_time).diff(Date.now(), 's'))
		}
	},
	async onRefresh() {
		await goodsDetailControl.run({ id: params.value.product_id })
	}
})

// 微信小程序的 onLoad 生命周期
onLoad(async () => {
	// options 中包含路由参数
	await load()
})
</script>

<style lang="scss">
.sku-active {
	border: 4rpx solid #c55553;
	position: relative;
	&::after {
		content: '';
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-bottom: 5px solid #c55553;
		background-color: transparent;
		z-index: 9;
	}
	opacity: 1;
}
.hibe-scrollbar {
	&::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
		background: transparent;
		color: transparent;
	}
}
</style>
<style lang="scss">
.goods-desc {
	._img {
		display: block;
	}
	:deep(._img) {
		display: block;
	}
}
</style>
