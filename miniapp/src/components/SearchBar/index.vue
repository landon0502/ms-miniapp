<template>
	<view
		class="flex flex-row items-center w-full h-64rpx bg-white rounded-full px-16rpx box-border search-bar"
		:class="{ 'search-bar-disabled': props.disabled }"
		@click="onClick"
		:style="props.customStyle"
	>
		<view class="w-24px flex-shrink-0" @click="onClickIcon">
			<uv-icon name="search" :size="22" :color="props.iconColor" />
		</view>
		<view class="flex-1 pos-relative">
			<view
				v-if="showHotWords"
				class="pos-absolute top-0 bottom-0 left-0 right-0 pointer-events-auto"
			>
				<swiper
					class="h-full pointer-events-auto"
					:interval="mergeHotWordsSwiperProps.interval"
					:vertical="mergeHotWordsSwiperProps.vertical"
					:disable-touch="mergeHotWordsSwiperProps.disableTouch"
					:autoplay="mergeHotWordsSwiperProps.autoplay"
					:circular="mergeHotWordsSwiperProps.circular"
					@change="onSwiperChange"
				>
					<swiper-item
						v-for="(text, index) in props.hotWords"
						:key="index"
						class="pointer-events-auto flex items-center"
					>
						<text class="font-size-14px" :style="props.placeholderStyle">{{ text }}</text>
					</swiper-item>
				</swiper>
			</view>
			<uv-input
				v-if="inputType === 'input'"
				v-bind="{ ...props, customStyle: props.customInputStyle, placeholder }"
				@update:modelValue="(e) => emit('update:modelValue', e)"
				@input="onChange"
				@confirm="onConfirm"
				@blur="onBlur"
				@focus="onFocus"
				@clear="onClear"
				@keyboardheightchange="onKeyboardheightchange"
				:border="'none'"
			>
			</uv-input>
			<TagInput
				v-if="inputType === 'tags'"
				v-bind="{
					...props,
					customStyle: props.customInputStyle,
					placeholder,
					closable: props.tagClosable
				}"
				@update:modelValue="(e) => emit('update:modelValue', e)"
				@change="onChange"
				@confirm="onConfirm"
				@blur="onBlur"
				@focus="onFocus"
				@clear="onClear"
				@keyboardheightchange="onKeyboardheightchange"
				:border="'none'"
			/>
		</view>
		<uv-line direction="col" length="28rpx" v-if="showBtn" />
		<view
			class="px-12rpx border-color-#E5E6EB h-20px flex-shrink-0"
			@click.stop="onSearch"
			v-if="showBtn"
			:style="props.customBtnStyle"
		>
			<text class="text-primary font-size-14px line-height-20px block whitespace-nowrap">搜索</text>
		</view>
	</view>
</template>
<script setup name="SearchBar">
import TagInput from '../TagInput'
import { isEmpty, isArray, merge } from 'lodash'
import { computed, nextTick, ref } from 'vue'
import SearchProps from './props'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		multipleSlots: true
	}
	// #endif
})
const props = defineProps(SearchProps.props)

const curHotWord = defineModel('hotText', { type: String })
curHotWord.value = props.hotWords?.[0] ?? ''
const inputFoucs = ref(false)

const showHotWords = computed(() => {
	if (
		!inputFoucs.value &&
		!props.modelValue &&
		isArray(props.hotWords) &&
		!isEmpty(props.hotWords)
	) {
		return true
	}
	return false
})
const placeholder = computed(() => {
	if (showHotWords.value) {
		return void 0
	}
	return props.placeholder
})

const mergeHotWordsSwiperProps = computed(() => {
	let defaultProps = {
		disableTouch: true,
		vertical: true,
		interval: 5000,
		autoplay: true,
		circular: true
	}
	return merge({}, defaultProps, props.hotWordsSwiperProps)
})

const emit = defineEmits({
	change: true,
	search: true,
	confirm: true,
	blur: true,
	focus: true,
	clear: true,
	click: true,
	clickIcon: true,
	'update:modelValue': true,
	keyboardheightchange: true,
	hotChange: true,
	'update:hotWord': true
})

const onSwiperChange = (e) => {
	curHotWord.value = props.hotWords[e.detail.current]
	emit('hotChange', { text: curHotWord.value, index: e.detail.current })
	emit('update:hotWord', { text: curHotWord.value, index: e.detail.current })
}

function onChange(...args) {
	emit('change', ...args)
}

function onSearch() {
	if (props.useCurrentHotWord && !isEmpty(props.hotWords) && !props.modelValue && !props.value) {
		emit('update:modelValue', curHotWord.value)
	}
	nextTick(() => {
		emit('search', props.modelValue)
	})
}
function onConfirm(...args) {
	emit('confirm', ...args)
}

function onBlur(...args) {
	inputFoucs.value = false
	emit('blur', ...args)
}

function onFocus(...args) {
	inputFoucs.value = true
	emit('focus', ...args)
}

function onClear(...args) {
	emit('clear', ...args)
}

function onClick(...args) {
	emit('click', ...args)
}
function onClickIcon(...args) {
	emit('clickIcon', ...args)
}
function onKeyboardheightchange(...args) {
	emit('keyboardheightchange', ...args)
}
</script>
<style scoped lang="scss">
.search-bar-disabled {
	background: rgb(245, 247, 250);
}
</style>
