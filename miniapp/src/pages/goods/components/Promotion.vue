<template>
	<view>
		<WithPopup ref="popupRef">
			<scroll-view scroll-y class="w-full h-1000rpx">
				<view class="w-full h-1000rpx p-24rpx flex flex-col gap-24rpx box-border">
					<view
						class="flex flex-col items-center justify-center gap-24rpx"
						v-if="!isUndef(discountPrice)"
					>
						<view
							class="rounded-8rpx border-1rpx border-solid border-#B6161C bg-#B6161C11 flex flex-center flex-col px-24rpx py-4px"
						>
							<PriceText
								:value="discountPrice"
								text-color="#B6161C"
								:decimalsStyle="{ fontSize: '16px' }"
								:fontBold="600"
							/>
							<text class="text-#B6161C text-10px">预估到手价</text>
						</view>
						<view
							class="flex flex-col items-center bg-#B6161C10 w-full py-48rpx border-t-2px border-t-solid border-t-#B6161C pos-relative promotion-info"
						>
							<text class="text-10px text-#2F2F2F">现在购买，享受一下优惠</text>
							<view class="flex flex-row items-center justify-center gap-48rpx">
								<view class="flex flex-col gap-18rpx items-center w-200rpx">
									<text class="font-bold text-14px text-#B6161C">￥{{ currentSku?.price }}</text>
									<view
										class="text-10px text-#B6161C border-1rpx border-solid border-#B6161C rounded-2px text-center bg-#fff w-120rpx"
										>参考价</view
									>
								</view>
								<text class="text-14px text-#B6161C">-</text>
								<view class="flex flex-col gap-18rpx items-center w-200rpx">
									<text class="font-bold text-14px text-#B6161C"
										>￥{{ new Decimal(currentSku?.price).minus(discountPrice).toFixed(2) }}</text
									>
									<view
										class="text-10px text-#B6161C border-1rpx border-solid border-#B6161C rounded-2px text-center bg-#fff w-120rpx"
										>促销价</view
									>
								</view>
							</view>
						</view>
					</view>
					<view class="flex flex-col gap-24rpx" v-if="!isEmpty(productInfo?.promotions)">
						<text class="text-10px text-#999">优惠活动</text>
						<view
							class="flex flex-row gap-16rpx"
							v-for="promotion in productInfo?.promotions"
							:key="promotion.id"
						>
							<view>
								<view class="px-4px py-2px rounded-2px bg-#FEEBF2 flex flex-center">
									<text class="text-#B6161C text-10px">赠品</text>
								</view>
							</view>
							<view class="flex flex-col gap-12rpx flex-1">
								<text class="text-10px text-#333">{{ promotion.name }}</text>
								<text class="text-10px text-#333">{{ promotion.sku_name }}</text>
							</view>
						</view>
					</view>
					<view v-if="!isEmpty(productInfo?.coupons)">
						<text class="text-10px text-#999">可领取优惠券</text>
						<view class="flex flex-col mt-24rpx gap-24rpx">
							<view class="flex flex-row" v-for="coupon in productInfo.coupons" :key="coupon.id">
								<view
									class="w-180rpx h-140rpx flex-shrink-0 bg-#B6161C flex flex-center flex-col gap-12rpx pos-relative"
								>
									<view class="h-full w-10rpx decorate-line pos-absolute top-0 left-0"></view>
									<text class="text-12px text-#fff">
										￥<text class="text-16px">{{ Number(coupon.discount_amount) }}</text>
									</text>
									<text class="text-12px text-#fff">满减券</text>
								</view>
								<view class="flex-1 flex flex-col justify-between p-12rpx box-border">
									<text class="text-12px text-#B6161C">{{ coupon.name }}</text>
									<view class="flex flex-row justify-between items-center">
										<text class="text-10px text-#999">
											{{ dayjs(coupon.start_time).format('YYYY.MM.DD') }}-{{
												dayjs(coupon.end_time).format('YYYY.MM.DD')
											}}
										</text>
										<view
											class="text-12px text-#fff line-height-24px rounded-full bg-#B6161C px-12px"
										>
											点击领取
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</WithPopup>
	</view>
</template>
<script setup>
import WithPopup from '@/components/WithPopup'
import { isEmpty } from 'lodash'
import { ref, shallowRef, computed } from 'vue'
import dayjs from 'dayjs'
import PriceText from '@/components/PriceText'
import { isUndef } from '@/utils/is'
import Decimal from 'decimal.js'

const popupRef = shallowRef()
const productInfo = ref()
const currentSku = ref()

/**
 * 优惠价格
 */
const discountPrice = computed(() => {
	if (currentSku.value?.activities) {
		return null
	}
	if (productInfo.value?.discounts) {
		return new Decimal(Number(productInfo.value?.discounts?.value))
			.times(Number(currentSku.value?.price || 0))
			.div(10)
			.toFixed(2)
			.toString()
	}
	return null
})

const open = (info, sku) => {
	productInfo.value = info
	currentSku.value = sku
	console.log(popupRef.value)
	popupRef.value.open({
		title: '优惠',
		mode: 'bottom',
		footer: false,
		round: '16px'
	})
}

defineExpose({
	open
})
</script>
<style scoped lang="scss">
.promotion-info {
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
}
</style>
