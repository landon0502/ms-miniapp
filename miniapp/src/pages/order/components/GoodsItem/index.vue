<template>
	<view class="flex flex-row gap-12px pos-relative" @click="handleClick">
		<view class="border-1rpx border-solid border-#F1F1F1 w-[80px] h-[80px] overflow-hidden flex-shrink-0">
			<uv-image :src="fullUploadFilePath(props.image)" :width="80" :height="80" />
		</view>
		<view class="flex flex-col">
			<text class="font-size-13px text-#636363"
				>{{ goods.product.name }} {{ goods.sku.sku_name }}</text
			>
			<view class="mt-24px font-size-13px">
				<text class="text-#B4B4B4">x{{ goods.quantity }}</text>
			</view>
		</view>
		<view class="pos-absolute right-0 bottom-0">
			<PriceText
				textColor="#000000"
				:value="goods.price"
				:currency="goods.sku.currency"
			></PriceText>
		</view>
	</view>
</template>

<script setup>
import { defineProps } from 'vue'
import PriceText from '@/components/PriceText/index.vue'
import { fullUploadFilePath } from '@/utils/utils'
const props = defineProps({
	goods: {
		type: Object,
		default: () => ({})
	},
	image: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['goods-tap'])

const handleClick = () => {
	emit('goods-tap', props.goods)
}
</script>
