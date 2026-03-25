<template>
	<PageContainer
		:navBarProps="{
			title: '商品详情',
			leftIcon: 'arrow-left',
			rightIcon: 'more'
		}"
	>
		<!-- 加载状态 -->
		<view v-if="loading" class="flex justify-center items-center py-48rpx">
			<text>加载中...</text>
		</view>

		<!-- 错误状态 -->
		<view v-else-if="error" class="flex justify-center items-center py-48rpx">
			<text class="text-red-500">{{ error }}</text>
		</view>

		<!-- 商品内容 -->
		<template v-else>
			<view class="main-image-section" :class="theme === 'black' ? 'bg-[#0a0a0a]' : 'bg-white'">
				<uv-image :src="currentImage" mode="aspectFill" class="w-[750rpx] h-[750rpx]" />
			</view>

			<view
				class="flex items-center p-[24rpx_32rpx]"
				:class="theme === 'black' ? 'bg-[#0a0a0a]' : 'bg-white'"
			>
				<text
					class="text-[24rpx] mr-[24rpx]"
					:class="theme === 'black' ? 'text-[#888]' : 'text-[#666]'"
					>选择</text
				>
				<view class="flex gap-[16rpx]">
					<view
						v-for="(img, index) in imageList"
						:key="index"
						class="w-[100rpx] h-[100rpx] rounded-[8rpx] overflow-hidden border-[2rpx] border-transparent"
						:class="
							currentIndex === index ? (theme === 'black' ? 'border-[#fff]' : 'border-[#e83232]') : ''
						"
						@click="currentIndex = index"
					>
						<uv-image :src="img" mode="aspectFill" class="w-full h-full" />
					</view>
				</view>
			</view>

			<view class="p-[32rpx] mt-[16rpx]" :class="theme === 'black' ? 'bg-[#0a0a0a]' : 'bg-white'">
				<view class="flex items-center justify-between mb-[24rpx]">
					<view class="flex items-baseline">
						<text
							class="text-[28rpx] font-semibold"
							:class="theme === 'black' ? 'text-[#fff]' : 'text-[#e83232]'"
							>¥</text
						>
						<text
						class="text-[48rpx] font-bold ml-[4rpx]"
						:class="theme === 'black' ? 'text-[#fff]' : 'text-[#e83232]'"
						>{{ productInfo?.data?.price || '0.00' }}</text
					>
					</view>
					<view
						class="flex items-center px-[24rpx] py-[12rpx] rounded-full gap-[8rpx]"
						:class="theme === 'black' ? 'bg-[#fff]' : 'bg-[#e83232]'"
					>
						<text
							class="text-[26rpx] font-medium"
							:class="theme === 'black' ? 'text-[#0a0a0a]' : 'text-white'"
							>预估到手 ¥ {{ productInfo?.data?.promoPrice || '0.00' }}</text
						>
						<uv-icon
							name="arrow-right"
							size="24rpx"
							:color="theme === 'black' ? '#0a0a0a' : '#fff'"
						/>
					</view>
				</view>

				<view class="flex items-center justify-between mb-[24rpx]">
					<view class="flex gap-[12rpx]">
						<view
						v-for="(label, index) in productInfo?.data?.promotion_labels || []"
						:key="index"
						class="px-[16rpx] py-[8rpx] border rounded-[8rpx] text-[24rpx]"
						:class="
							theme === 'black'
								? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-[#fff]'
								: 'bg-[rgba(232,50,50,0.08)] border-[rgba(232,50,50,0.2)] text-[#e83232]'
						"
						>{{ label }}</view
						>
					</view>
					<view class="flex items-center gap-[4rpx]">
						<text class="text-[24rpx]" :class="theme === 'black' ? 'text-[#fff]' : 'text-[#e83232]'"
							>领券</text
						>
						<uv-icon
							name="arrow-right"
							size="24rpx"
							:color="theme === 'black' ? '#fff' : '#e83232'"
						/>
					</view>
				</view>

				<view class="flex items-center mb-[24rpx]">
					<view
						class="px-[16rpx] py-[8rpx] rounded-[8rpx] text-[24rpx] text-white mr-[16rpx]"
						:class="theme === 'black' ? 'bg-[#333]' : 'bg-[#1a1a1a]'"
						>离岛免税</view
					>
					<text class="text-[24rpx] flex-1" :class="theme === 'black' ? 'text-[#888]' : 'text-[#999]'"
						>来海南，买免税。凭离岛机票/火车票/船票购买</text
					>
				</view>

				<view>
					<text
						class="text-[32rpx] font-semibold block mb-[12rpx]"
						:class="theme === 'black' ? 'text-[#fff]' : 'text-[#1a1a1a]'"
						>{{ productInfo?.data?.name || '加载中...' }}</text
					>
					<text
						class="text-[26rpx] leading-[40rpx]"
						:class="theme === 'black' ? 'text-[#888]' : 'text-[#666]'"
						>{{ productInfo?.data?.description || '加载中...' }}</text
					>
				</view>
			</view>

			<!-- 商品规格 -->
			<view class="p-[32rpx] mt-[16rpx]" :class="theme === 'black' ? 'bg-[#0a0a0a]' : 'bg-white'">
				<text
					class="text-[28rpx] font-semibold block mb-[24rpx]"
					:class="theme === 'black' ? 'text-[#fff]' : 'text-[#1a1a1a]'"
					>商品规格</text
				>
				<view class="flex flex-wrap gap-[16rpx]">
					<view
					v-for="(sku, index) in productInfo?.data?.skus || []"
					:key="index"
					class="px-[24rpx] py-[16rpx] border rounded-[8rpx] text-[24rpx]"
					:class="
						theme === 'black'
							? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-[#fff]'
							: 'bg-[#f5f5f5] border-[#e0e0e0] text-[#333]'
					"
				>
					{{ sku.sku_name }} - {{ sku.measurement_type }}
				</view>
				</view>
			</view>

			<!-- 优惠券 -->
			<view class="p-[32rpx] mt-[16rpx]" :class="theme === 'black' ? 'bg-[#0a0a0a]' : 'bg-white'">
				<text
					class="text-[28rpx] font-semibold block mb-[24rpx]"
					:class="theme === 'black' ? 'text-[#fff]' : 'text-[#1a1a1a]'"
					>可用优惠券</text
				>
				<view class="flex flex-col gap-[16rpx]">
					<view
					v-for="(coupon, index) in productInfo?.data?.coupons || []"
					:key="index"
					class="flex items-center justify-between p-[24rpx] border rounded-[8rpx]"
					:class="
						theme === 'black'
							? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)]'
							: 'bg-[#fff3f3] border-[rgba(232,50,50,0.2)]'
					"
				>
					<view class="flex items-center gap-[16rpx]">
						<view
							class="px-[24rpx] py-[12rpx] rounded-[8rpx] text-[24rpx] font-semibold text-white"
							:class="theme === 'black' ? 'bg-[#e83232]' : 'bg-[#e83232]'"
						>
							¥{{ coupon.value }}
						</view>
						<view>
							<text
								class="text-[24rpx] font-medium block"
								:class="theme === 'black' ? 'text-[#fff]' : 'text-[#333]'"
							>{{ coupon.name }}</text
							>
							<text
								class="text-[20rpx] block mt-[4rpx]"
								:class="theme === 'black' ? 'text-[#888]' : 'text-[#999]'"
							>满{{ coupon.min_amount }}元可用</text
							>
						</view>
					</view>
					<uv-icon
						name="arrow-right"
						size="24rpx"
						:color="theme === 'black' ? '#fff' : '#e83232'"
					/>
				</view>
				<view v-if="(!productInfo?.data?.coupons || productInfo.data.coupons.length === 0)" class="text-center py-[32rpx]">
					<text class="text-[24rpx]" :class="theme === 'black' ? 'text-[#888]' : 'text-[#999]'">暂无可用优惠券</text>
				</view>
				</view>
			</view>
		</template>

		<template #footer>
			<view
				class="flex items-center p-[16rpx_32rpx] border-t pb-[calc(16rpx_+_env(safe-area-inset-bottom))]"
				:class="theme === 'black' ? 'bg-[#0a0a0a] border-[#222]' : 'bg-white border-[#f0f0f0]'"
			>
				<view class="flex gap-[48rpx] mr-[32rpx]">
					<view class="flex flex-col items-center gap-[4rpx]">
						<image
							src="/src/assets/images/icon-home.svg"
							class="w-[40rpx] h-[40rpx]"
							:class="theme === 'black' ? 'filter invert(50%)' : ''"
						/>
						<text class="text-[20rpx]" :class="theme === 'black' ? 'text-[#888]' : 'text-[#666]'"
							>首页</text
						>
					</view>
					<view class="flex flex-col items-center gap-[4rpx]">
						<image
							src="/src/assets/images/icon-heart.svg"
							class="w-[40rpx] h-[40rpx]"
							:class="theme === 'black' ? 'filter invert(50%)' : ''"
						/>
						<text class="text-[20rpx]" :class="theme === 'black' ? 'text-[#888]' : 'text-[#666]'"
							>收藏</text
						>
					</view>
					<view class="flex flex-col items-center gap-[4rpx] relative">
						<uv-badge :count="3" :type="theme === 'black' ? 'primary' : 'error'">
							<image
								src="/src/assets/images/icon-cart.svg"
								class="w-[40rpx] h-[40rpx]"
								:class="theme === 'black' ? 'filter invert(50%)' : ''"
							/>
						</uv-badge>
						<text class="text-[20rpx]" :class="theme === 'black' ? 'text-[#888]' : 'text-[#666]'"
							>购物车</text
						>
					</view>
				</view>
				<view class="flex flex-1 gap-0">
					<view
						class="flex-1 h-[88rpx] leading-[88rpx] text-center text-[30rpx] font-semibold rounded-l-full"
						:class="theme === 'black' ? 'text-[#fff] bg-[#333]' : 'text-[#e83232] bg-[#fff3f3]'"
						>加入购物袋</view
					>
					<view
						class="flex-1 h-[88rpx] leading-[88rpx] text-center text-[30rpx] font-semibold text-white rounded-r-full"
						:class="theme === 'black' ? 'bg-[#fff] text-[#0a0a0a]' : 'bg-[#e83232]'"
						>立即购买</view
					>
				</view>
			</view>
		</template>
	</PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/composables'
import useServices from '../useServices'
import { onLoad } from '@dcloudio/uni-app'

const {params} = useRouter()
const currentIndex = ref(0)
const theme = ref('red')

// 使用 useServices
const { goodsDetailControl } = useServices()

// 从 goodsDetailControl 中解构出属性，确保响应式
const { data: productInfo, loading, error } = goodsDetailControl

// 打印 productInfo 结构，用于调试
console.log('productInfo:', productInfo)

const imageList = computed(() => {
	if (!productInfo.value?.data?.skus || productInfo.value.data.skus.length === 0) {
		return [
			'https://via.placeholder.com/750x750',
			'https://via.placeholder.com/750x750/ff0000',
			'https://via.placeholder.com/750x750/00ff00',
			'https://via.placeholder.com/750x750/0000ff',
			'https://via.placeholder.com/750x750/ffff00'
		]
	}
	return productInfo.value.data.skus.map(sku => sku.image)
})

const currentImage = computed(() => imageList.value[currentIndex.value])

// 微信小程序的 onLoad 生命周期
onLoad((options) => {
	// options 中包含路由参数
	const goodsId = options.id || params.value.id || 1
	goodsDetailControl.run({ id: goodsId })
})

onMounted(() => {
	if (params.value?.theme) {
		theme.value = params.value.theme === 'black' ? 'black' : 'red'
	}
})
</script>

<style>
page {
	background-color: #f5f5f5;
}
</style>
