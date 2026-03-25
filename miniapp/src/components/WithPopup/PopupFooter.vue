<template>
	<view class="bottom-bar" :style="props.footerStyle">
		<uv-line v-if="props.footerTopBorder" :color="props.footerBorderColor" />
		<view class="p-24rpx" v-if="props.buttonTheme === 'button'">
			<uv-row gutter="16">
				<uv-col :span="12 / btnColumn" v-if="showCancelBtn">
					<view>
						<uv-button v-bind="cancelBtnProps" type="info" @click="handleCancel">
							{{ cancelText }}
						</uv-button>
					</view>
				</uv-col>
				<uv-col :span="12 / btnColumn" v-if="showConfirmBtn">
					<view>
						<uv-button
							type="primary"
							v-bind="confirmBtnProps"
							@click="handleConfirm"
							:loading="loading"
						>
							{{ okText }}
						</uv-button>
					</view>
				</uv-col>
			</uv-row>
		</view>
		<view class="flex flex-row items-center justify-center py-24rpx" v-else>
			<view class="w-4/5 flex flex-row justify-center rounded-16rpx overflow-hidden">
				<view class="flex-1">
					<uv-button
						type="info"
						@click="handleCancel"
						:custom-style="{
							border: 0,
							background: '#005BAC21',
							width: '100%',
							borderRadius: 0,
							height: '44px'
						}"
						:customTextStyle="{
							color: 'var(--uv-primary)',
							fontSize: '16px'
						}"
						:text="cancelText"
						v-bind="cancelBtnProps"
					>
					</uv-button>
				</view>
				<view class="flex-1">
					<uv-button
						type="primary"
						@click="handleConfirm"
						:loading="loading"
						:custom-style="{
							border: 0,
							background: 'var(--uv-primary)',
							width: '100%',
							borderRadius: 0,
							height: '44px'
						}"
						:custom-text-style="{
							color: 'var(--uv-white-color)',
							fontSize: '16px'
						}"
						:text="okText"
						v-bind="confirmBtnProps"
					>
					</uv-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup name="PopupFooter">
import { computed, ref } from 'vue'
import { popupFooterProps } from './props'
const props = defineProps(popupFooterProps.props)
const loading = ref(false)

const btnColumn = computed(() => {
	if (!props.showCancelBtn || !props.showConfirmBtn) {
		return 1
	}
	return 2
})

const emit = defineEmits({
	cancel: true,
	confirm: true
})
function handleCancel() {
	emit('cancel')
}
function handleConfirm() {
	emit('confirm')
}
function setLoading(v) {
	loading.value = v
}
defineExpose({
	setLoading
})
</script>

<style scoped lang="scss">
.bottom-bar {
	width: 100%;
	box-sizing: border-box;
}
</style>
