<template>
	<view class="flex flex-row gap-12px">
		<view class="w-90px h-90px border-1px border-#F1F1F1 border-solid flex-shrink-0">
			<uv-image :src="fullUploadFilePath(props.image)" mode="aspectFill" :width="90" :height="90" />
		</view>
		<view class="flex-1">
			<view class="flex justify-between">
				<view>
					<text class="font-size-14px text-#303030">{{ props.data.product_name }}</text>
				</view>
			</view>
			<view class="mt-8px flex flex-row items-center justify-between">
				<text class="font-size-14px text-#A5A5A5">x{{ props.data.quantity }}</text>
				<view class="flex flex-row items-center justify-end gap-8px">
					<text class="font-size-12px text-#5E5D5D">
						实付<text class="font-size-14px text-#C49262 font-bold">
							<text class="font-size-12px">￥</text>{{ Number(props.data.actual_price).toFixed(2) }}
						</text>
					</text>
					<text class="font-size-12px text-#A5A5A5 font-400"
						>￥{{ Number(props.data.original_price).toFixed(2) }}</text
					>
				</view>
			</view>
			<view class="flex mt-8px">
				<view class="flex items-center justify-center px-4px bg-#F5F5F5 line-height-20px rounded-4rpx overflow-hidden">
					<text class="font-size-11px text-#A5A5A5">不支持7天无理由退货</text>
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
