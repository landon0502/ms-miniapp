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
				<view class="h-[750rpx] w-full main-image-section pos-relative">
					<swiper
						class="h-[750rpx] w-full"
						circular
						:current="currentImageIndex"
						@change="currentImageIndex = $event.detail.current"
					>
						<swiper-item v-for="(img, index) in imageList" :key="index">
							<uv-image
								:src="fullUploadFilePath(img)"
								mode="aspectFill"
								width="750rpx"
								height="750rpx"
								lazyLoad
							/>
						</swiper-item>
					</swiper>
					<view
						class="w-110rpx pos-absolute z-2 right-24rpx top-200rpx bg-#343233 border-2rpx border-#343233 border-solid rounded-6px overflow-hidden"
						v-if="!isEmpty(productInfo?.promotions)"
						@click="
							() => {
								// promotionRef.open(productInfo, currentSku)
							}
						"
					>
						<view class="w-full rounded-6px overflow-hidden bg-#fff">
							<view v-for="(item, index) in productInfo?.promotions" class="w-110rpx h-110rpx">
								<uv-image
									:src="fullUploadFilePath(item.image)"
									:width="'110rpx'"
									:height="'110rpx'"
									lazyLoad
								/>
								<uv-line v-if="productInfo?.promotions?.length > index + 1" />
							</view>
						</view>
						<view class="w-full flex flex-row items-center justify-center py-6rpx">
							<text class="text-10px text-#fff">赠品规则</text>
							<uv-icon name="arrow-right" :size="8" :color="'#FFFFFF'" />
						</view>
					</view>
					<view
						class="pos-absolute bottom-24rpx left-50% translate-x-[-50%] text-12px text-#fff text-center line-height-[24rpx] rounded-full bg-#33333380 px-12rpx py-4rpx z-2"
					>
						{{ currentImageIndex + 1 }}/{{ imageList.length }}
					</view>
				</view>

				<view
					class="flex items-center p-[18rpx_12rpx] bg-white gap-24rpx"
					v-if="skuList.length > 1"
				>
					<view class="px-16rpx">
						<text class="text-[24rpx]">
							{{ { capacity: '计量', spec: '规格', series: '系列' }[productInfo?.measurement_type] }}
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
										:src="fullUploadFilePath(sku.images[0] || '')"
										mode="aspectFill"
										class="w-full h-full"
										width="100%"
										height="100%"
										lazyLoad
									/>
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
				<view
					class="box-border px-32rpx w-full h-120rpx bg-gradient-to-r from-[#B8151B] via-#DD3B38 to-[#B8151B] flex flex-row items-center justify-between"
					v-if="currentSku?.activities"
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
									:prefixStyle="{ fontSize: '16px' }"
									:decimalsStyle="{ fontSize: '16px' }"
									:value="currentSku?.price"
									textSize="large"
									:textColor="productInfo?.theme === 'black' ? '#fff' : '#E53026'"
								/>
								<view
									class="discount-price position-relative"
									v-if="!isUndef(discountPrice)"
									:style="{
										'--bg-color': productInfo?.theme === 'black' ? '#fff' : '#E53026',
										'--bar-bg': productInfo?.theme === 'black' ? '#000' : '#FFF'
									}"
									@click="
										() => {
											// promotionRef.open(productInfo, currentSku)
										}
									"
								>
									<view class="discount-price-box pos-relative z-4 pr-8rpx pl-12rpx flex items-center justify-center bg-[var(--bg-color)]">
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
													>预估到手</text
												>
											</template>
										</PriceText>
										<view class="pt-2px">
											<uv-icon name="arrow-right" :color="productInfo?.theme === 'black' ? '#333' : '#ffffff'" :size="10" />
										</view>
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
									<view class="flex flex-row items-center gap-12rpx flex-1 flex-wrap">
										<uv-tags
											v-for="label in productInfo?.tags"
											:key="label"
											:text="label"
											:bgColor="productInfo?.theme === 'black' ? '#FFF9F9' : '#FFEAEB'"
											:color="productInfo?.theme === 'black' ? '#000' : '#E53026'"
											borderColor="transparent"
											size="mini"
										></uv-tags>
									</view>
									<view
										class="flex items-center justify-between gap-6rpx pr-4px pl-8px py-1px rounded-full h-32rpx mt-3px"
										v-if="!isEmpty(productInfo?.coupons)"
										
										:style="{
											background: productInfo?.theme === 'black' ? '#000' : '#fff'
										}"
									>
										<text
											class="text-[10px] text-#E53026"
											:style="{
												color: productInfo?.theme === 'black' ? '#fff' : '#E53026'
											}"
											>领券</text
										>
										<view class="flex flex-center w-24rpx h-24rpx rounded-full bg-#fff">
											<uv-icon
												name="arrow-right"
												:size="8"
												:color="productInfo?.theme === 'black' ? '#000' : '#E53026'"
											/>
										</view>
									</view>
								</view>
								<view>
									<text class="text-[12px] text-#2F2F2F">
										<text
											class="py-2px px-4px text-[10px] text-#fff inline-block bg-#AC8B6A rounded-4rpx"
										>
											离岛免税
										</text>
										来海南，买免税。凭离岛机票/火车票/船票购买
									</text>
								</view>
								<view>
									<text class="text-17px">{{ productInfo?.name }}</text>
								</view>
								<view>
									<text class="text-12px text-#A4A4A4">{{ productInfo?.description }}</text>
								</view>
							</view>
						</template>
					</Card>

					<!-- 促销 -->
					<Card
						:showHeader="false"
						v-if="!isEmpty(productInfo?.discounts) || !isEmpty(productInfo?.promotions)"
					>
						<template #content>
							<view class="flex flex-row gap-32rpx">
								<text class="text-13px font-500">促销</text>
								<view class="flex-1 flex flex-col gap-18rpx">
									<template v-if="!isEmpty(productInfo?.discounts)">
										<view
											v-for="discount in productInfo?.discounts"
											:key="discount.id"
											class="flex flex-row gap-12rpx items-cener"
										>
											<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
												<text class="text-#E53026 text-11px">
													{{
														`${discount.min_quantity > 1 ? discount.min_quantity + '件' : ''}${Number(discount.value)}折`
													}}
												</text>
											</view>
											<view class="flex-1 flex items-center">
												<text class="text-12px line-clamp-1"
													>此商品专享{{
														`${discount.min_quantity > 1 ? '满' + discount.min_quantity + '件' : ''}${Number(discount.value)}折`
													}}</text
												>
											</view>
										</view>
									</template>

									<view
										v-for="promotion in productInfo?.promotions"
										:key="promotion.id"
										class="flex flex-row gap-12rpx items-cener"
									>
										<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
											<text class="text-#E53026 text-10px">{{ promotion?.label }}</text>
										</view>
										<view class="flex-1 flex items-center">
											<text class="text-12px line-clamp-1">{{ promotion?.name }}</text>
										</view>
									</view>
									<view
										v-if="!isEmpty(productInfo?.coupons)"
										class="flex flex-row gap-12rpx items-center"
									>
										<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
											<text class="text-#E53026 text-10px"> 领券 </text>
										</view>
										<view class="flex-1 flex flex-wrap gap-4px">
											<view
												class="coupons-item pos-relative flex-center px-8px py-3px rounded-3px"
												v-for="coupon in productInfo.coupons"
												:key="coupon.id"
											>
												<view class="border-bg"></view>
												<text class="text-10px text-#E53026">{{ coupon.label }}</text>
											</view>
										</view>
									</view>
								</view>
								<view>
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
			<view class="w-full h-54px">
				<template v-if="productInfo && !loading">
					<view class="w-full flex items-center px-12rpx py-12rpx h-54px box-border">
						<view class="flex gap-[12rpx] mr-[24rpx]">
							<view class="flex flex-col items-center gap-[4rpx] w-70rpx flex-shrink-0">
								<uv-icon :name="homeIcon" :size="18" />
								<text class="text-[20rpx] text-[#333] line-clamp-1">首页</text>
							</view>
							<view class="flex flex-col items-center gap-[4rpx] w-70rpx flex-shrink-0">
								<uv-icon :name="aixinIcon" :size="18" />
								<text class="text-[20rpx] text-[#333] line-clamp-1">收藏</text>
							</view>
							<view class="flex flex-col items-center gap-[4rpx] w-70rpx flex-shrink-0">
								<uv-icon :name="gouwudaiIcon" :size="18" />
								<text class="text-[20rpx] text-[#333] line-clamp-1">购物袋</text>
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
								class="flex-1 h-[70rpx] leading-[70rpx] text-center text-12px rounded-full border-2rpx border-solid border-#E53026 bg-#E53026 text-#fff"
								:style="{
									backgroundColor: productInfo?.theme === 'black' ? '#000' : '#E53026',
									borderColor: productInfo?.theme === 'black' ? '#000' : '#E53026'
								}"
							>
								立即购买
							</view>
						</view>
					</view>
				</template>
			</view>
		</template>
		<template #page-extra>
			<!-- <Promotion ref="promotionRef" /> -->
			<view
				class="fixed right-10px bottom-300rpx bg-#fff rounded-full w-90rpx h-90rpx rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
			>
				<uv-icon :name="serverIcon" :size="32" />
			</view>
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
// import Promotion from '../components/Promotion'
import msIcon from '@/assets/images/ms.png'
import serverIcon from '@/assets/images/server2-icon.png'
import dayjs from 'dayjs'

const { params } = useRouter()
/**
 * 组件实例
 */
const pagingRef = shallowRef()
// const promotionRef = shallowRef()
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
const currentImageIndex = ref(0)

const skuList = computed(() => productInfo.value?.skus || [])
const currentSku = useMergeModelValue(() => skuList.value[currentIndex.value])
const imageList = computed(() => currentSku.value?.images ?? [])

/**
 * 优惠价格
 */
const discountPrice = computed(() => {
	let firstDiscount = productInfo.value?.discounts?.[0]
	if (firstDiscount) {
		return (firstDiscount.value * (currentSku.value?.price || 0)) / 10
	}
	return null
})

// 支付倒计时
const payCountDownTime = computed(() => {
	const { day, hour, minute, second } = formatMs(remaining.value * 1000)
	return [day * 24 + Number(hour), minute, second]
		.map((n) => (Number(n) < 10 ? '0' + Number(n) : Number(n)))
		.join(':')
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
.coupons-item {
	position: relative;
	overflow: hidden;

	.border-bg {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		border-radius: 6rpx;
		border: 2rpx solid #c82525;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
	}
	&::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: -6rpx;
		width: 10rpx;
		height: 10rpx;
		background-color: #f5f5f5;
		z-index: 9;
		border-radius: 10rpx;
		border: 1rpx solid #c82525;
	}
	&::before {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: -6rpx;
		width: 10rpx;
		height: 10rpx;
		background-color: #f5f5f5;
		z-index: 9;
		border-radius: 10rpx;
		border: 1rpx solid #c82525;
	}
}
.discount-price {
	margin-left: 16rpx;
	&-box{
		border-radius: 32rpx 40rpx 40rpx 0 ;
	}
	&::after {
		content: '';
		display: block;
		width: 40rpx;
		height: 40rpx;
		background-color: var(--bg-color);
		position: absolute;
		bottom: 0;
		left: -26rpx;
		z-index: 3;
		background: radial-gradient(circle at left top, var(--bar-bg) 0%, var(--bar-bg) 70%,var(--bg-color) 70%,var(--bg-color) 60%, );
	}
}
</style>
