<template>
    <view class="flex flex-row gap-12px pos-relative" @click="handleClick">
        <view>
            <uv-image :src="goods.sku.images[0]" :width="80" :height="80" />
        </view>
        <view class="flex flex-col">
            <text class="font-size-14px text-#636363">{{ goods.product.name }} {{ goods.sku.sku_name }}</text>
            <view class="mt-24px font-size-14px ">
                <text class="text-#B4B4B4">x{{ goods.quantity }}</text>
            </view>
        </view>
        <view class="pos-absolute right-0 bottom-0">
            <PriceText textColor="#000000" :value="goods.price" :currency="goods.sku.currency"></PriceText>
        </view>
    </view>
</template>

<script setup>
import { defineProps } from 'vue'
import PriceText from '@/components/PriceText/index.vue'

const props = defineProps({
  goods: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.goods)
}
</script>