<template>
	<view class="app-nav-bar" :style="contentStyle">
		<uv-navbar v-bind="props" @left-click="emit('leftClick')" @right-click="emit('rightClick')">
			<template #left>
				<view v-if="!leftIcon && !leftText"><slot name="left"></slot></view>
				<view v-else-if="leftText || leftIcon" class="flex flex-row items-center gap-6rpx">
					<view
						v-if="leftIcon"
						:class="{ 'round-bg': isTransparentBg, 'back-btn': true }"
						:style="{ width: addUnit(backBtnSize, 'px'), height: addUnit(backBtnSize, 'px') }"
					>
						<uv-icon :name="leftIcon" :size="leftIconSize" :color="leftIconColor"></uv-icon>
					</view>

					<text
						v-if="leftText"
						:style="{
							color: leftIconColor,
							...leftTextStyle
						}"
						class="uv-navbar__content__left__text color-#1D2129 font-bold whitespace-nowrap"
						>{{ leftText }}</text
					>
				</view>
			</template>
			<!-- template添加style是由于uniapp编译问题 -->
			<template #center style="width: 100%">
				<view v-if="!props.title" class="app-nav-bar__content">
					<slot name="center" style="width: 100%"></slot>
				</view>
				<view v-else class="app-nav-bar__content text-align-center">{{ props.title }}</view>
			</template>

			<template #right>
				<view
					class="flex flex-row justify-end items-center"
					:style="{
						minWidth: leftIcon && !props.avoidMenuButton ? addUnit(backBtnSize, 'px') : 'unset'
					}"
				>
					<slot name="right"></slot>
				</view>
			</template>
		</uv-navbar>
		<uv-line v-if="props.showBottomLine"></uv-line>
	</view>
</template>
<script setup name="NavBar">
import { computed } from 'vue'
import navbarProps from './props'
import { isTransparent } from '@/utils/is'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
import { useScreenInfo } from '@/composables'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true,
		dynamicSlots: true // 启用动态 slot
	}
	// #endif
})
const backBtnSize = 28
const props = defineProps(navbarProps.props)
const emit = defineEmits({
	leftClick: true,
	rightClick: true
})
const screenInfo = useScreenInfo()

const isTransparentBg = computed(() => isTransparent(props.bgColor))
// 内容区样式
const contentStyle = computed(() => {
	let w = addUnit(
		props.avoidMenuButton ? screenInfo.value.menuBtnRect.left : screenInfo.value.screenWidth,
		'px'
	)
	return {
		'--nav-bar-width': w,
		'--nav-bar-bgcolor': props.bgColor
	}
})
</script>

<style scoped lang="scss">
.app-nav-bar {
	width: 100%;
	box-sizing: border-box;

	:deep(.uv-navbar__content__left) {
		position: unset;
		padding: 0;
	}
	:deep(.uv-navbar__content__right) {
		position: unset;
		padding: 0;
	}

	&__content {
		flex: 1;
	}
	:deep(.uv-navbar__content) {
		padding: 0 12px;
		gap: 12rpx;
		justify-content: space-between;
		width: var(--nav-bar-width);
		box-sizing: border-box;
	}
	:deep(.uv-navbar--fixed) {
		background: var(--nav-bar-bgcolor);
	}
	.round-bg {
		background: #ffffff66;
		border-radius: 28px;
		border: 1px solid #ffffff;
		box-sizing: border-box;
	}
	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
