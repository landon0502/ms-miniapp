<template>
	<view class="flex flex-row gap-12px">
		<view class="w-80px h-80px border-1px border-#F1F1F1 border-solid">
			<uv-image :src="fullUploadFilePath(props.image)" mode="aspectFill" :width="80" :height="80" />
		</view>
		<view class="flex-1">
			<view class="flex justify-between">
				<view class="max-w-350rpx">
					<text class="font-size-13px text-#303030">{{ props.data.product_name }}</text>
				</view>
				<text class="font-size-12px text-#A5A5A5">￥ {{ props.data.original_price }}</text>
			</view>
			<view class="mt-8px flex flex-row items-center justify-between">
				<text class="font-size-13px text-#303030">x{{ props.data.quantity }}</text>
				<text class="font-size-13px text-#5E5D5D font-bold"
					>实付 <text class="font-size-12px">￥</text>{{ props.data.actual_price }}</text
				>
			</view>
			<view class="flex mt-4px">
				<view class="flex items-center justify-center px-4px py-0px bg-#F5F5F5">
					<text class="font-size-10px text-#A5A5A5">不支持7天无理由退货</text>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
import { fullUploadFilePath } from '@/utils/utils'
const props = defineProps({
	data: Object,
	image: String
})
</script>
