<template>
	<view class="number-box">
		<uv-number-box
			v-bind="props"
			:button-size="props.inputHeight"
			@focus="(e) => handleEmitEvent('focus', e)"
			@blur="(e) => handleEmitEvent('blur', e)"
			@change="(e) => handleEmitEvent('change', e)"
			@overlimit="(e) => handleEmitEvent('overlimit', e)"
			@update:modelValue="(v) => emit('update:modelValue', v)"
			ref="nvNumberBoxRef"
		>
			<template #minus>
				<view :style="props.minusBtnStyle">
					<uv-icon
						name="minus"
						:size="props.minusIconSize"
						bold
						:color="isDisabled('minus') ? '#BDBDBD' : '#1D2129'"
					/>
				</view>
			</template>

			<template #plus>
				<view :style="props.plusBtnStyle">
					<uv-icon
						name="plus"
						:size="props.plusIconSize"
						bold
						:color="isDisabled('plus') ? '#BDBDBD' : '#1D2129'"
					/>
				</view>
			</template>
		</uv-number-box>
	</view>
</template>
<script setup>
import numberBoxProps from './props'
// import mpMixin from '@/uni_modules/uv-ui-tools/libs/mixin/mpMixin'
import { computed, ref } from 'vue'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared'
	}
	// #endif
})
const nvNumberBoxRef = ref()
const props = defineProps(numberBoxProps.props)
const emit = defineEmits({
	focus: true,
	blur: true,
	change: true,
	overlimit: true,
	'update:modelValue': true
})

const isDisabled = computed(() => {
	return (type) => {
		return nvNumberBoxRef.value?.isDisabled(type)
	}
})

const handleEmitEvent = (type, e) => {
	emit(type, e)
}
</script>
<style lang="scss" scoped>
.number-box {
	:deep(.uv-number-box__input) {
		border-radius: 8rpx;
		flex-shrink: 0;
		background: #f5f6fa !important;
		margin: 0 18rpx;
		font-size: 28rpx;
	}
}
</style>
