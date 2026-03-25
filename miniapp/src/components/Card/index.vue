<template>
	<view
		class="card bg-[var(--uv-white-color)] rounded-8px flex flex-col gap-24rpx py-24rpx"
		:style="props.customStyle"
		@click.stop="onClick"
	>
		<view v-if="props.showHeader" @click.stop="onHeadClick">
			<view class="px-24rpx" :style="props.customHeadStyle">
				<view class="flex flex-row items-center justify-between w-full box-border">
					<!-- 头部 -->
					<slot name="title">
						<view class="flex flex-row gap-12rpx items-center" :style="props.titleWrapStyle">
							<view v-if="props.icon" :style="props.headIconStyle">
								<uv-icon
									:name="props.icon"
									:size="props.iconSize"
									:color="props.iconColor"
									:width="props.iconWidth"
									:height="props.iconHeight"
									:imgMode="props.iconImageMode"
								/>
							</view>

							<uv-text
								:text="props.title"
								:lines="props.titleLines"
								:bold="props.titleBold"
								:color="props.titleColor"
								:size="props.titleSize"
								:lineHeight="props.titleLineHeight"
							></uv-text>
							<slot v-if="$slots['title-label']" name="title-label"></slot>
						</view>
					</slot>
					<view class="card-head-right" v-if="$slots['head-right']">
						<slot name="head-right"></slot>
					</view>
				</view>
			</view>
			<view class="mt-24rpx px-24rpx" v-if="props.showHeadLine" :style="props.customHeadLineStyle">
				<uv-line v-bind="props.headLineProps" />
			</view>
		</view>
		<view
			class="px-24rpx w-full box-border card-content"
			:style="props.customContentStyle"
			v-if="$slots.content"
		>
			<!-- 内容 -->
			<slot name="content"></slot>
		</view>
		<view
			class="card-footer px-24rpx w-full box-border"
			:style="props.customFooterStyle"
			v-if="$slots.footer"
		>
			<!-- 底部 -->
			<slot name="footer"></slot>
		</view>
	</view>
</template>
<script setup name="Card">
import cardProps from './props'
const props = defineProps(cardProps.props)

const emit = defineEmits({
	click: true,
	headClick: true
})

const onClick = () => {
	emit('click')
}
const onHeadClick = () => {
	emit('headClick')
}
</script>
