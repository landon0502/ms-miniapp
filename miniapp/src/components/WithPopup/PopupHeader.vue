<template>
	<uv-navbar v-bind="props" :safeAreaInsetTop="false" :border="headBorder">
		<template #right v-if="props.showCloseIcon">
			<uv-icon
				name="close"
				color="var(--uv-main-color)"
				:size="props.rightIconSize"
				style="margin-right: 18rpx"
				@click="handleClose"
				bold
			/>
		</template>
	</uv-navbar>
</template>

<script setup name="PopupHeader">
import { popupHeaderProps } from './props'

defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true
	}
	// #endif
})

const props = defineProps(popupHeaderProps.props)

const emit = defineEmits({
	close: true
})
function handleClose() {
	emit('close')
}
</script>
