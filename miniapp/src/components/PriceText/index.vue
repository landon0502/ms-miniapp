<template>
	<view class="price-text">
		<view class="inline-block" v-if="$slots.prefix">
			<slot name="prefix"></slot>
		</view>
		<text :style="prefixTextStyle">￥</text>
		<text :style="integerTextStyle" v-if="!props.encrypt">{{ price[0] }}</text>
		<text :style="decimalsTextStyle" v-if="!props.encrypt"> .{{ price[1] }} </text>
		<text :style="integerTextStyle" class="align-bottom" v-if="props.encrypt">***</text>
		<text :style="decimalsTextStyle" class="align-bottom" v-if="props.encrypt">.**</text>
		<view class="inline-block" v-if="$slots.suffix">
			<slot name="suffix"></slot>
		</view>
	</view>
</template>
<script setup>
import { computed } from 'vue'
import { isString, isNumber } from 'lodash'
import { addUnit, addStyle } from '@/uni_modules/uv-ui-tools/libs/function/index.js'

const props = defineProps({
	value: [String, Number],
	prefixStyle: {
		type: Object
	},
	integerStyle: {
		type: Object
	},
	decimalsStyle: {
		type: Object
	},
	textSize: {
		validator(v) {
			return ['small', 'middle', 'large'].includes(v)
		},
		default: 'middle'
	},
	textColor: String,
	encrypt: Boolean,
	fontBold: {
		type: Number,
		default: 400
	}
})

const defaultCommonTextStyle = {
	color: 'var(--uv-red-color)',
	fontWeight: 'bold'
}

const splitValueByDot = (value) => {
	let price = value
	if (!isString(price) && !isNumber(price)) {
		return []
	}
	let [intNum, floatNum] = (price + '').split('.')
	return [intNum, floatNum]
}

const price = computed(() => {
	let v = uni.$uv.priceFormat(props.value, 2)
	return splitValueByDot(v)
})

const prefixTextStyle = computed(() => {
	const size = { small: 10, middle: 11, large: 12 }
	const color = props.textColor || defaultCommonTextStyle.color
	return addStyle(
		Object.assign(
			{
				fontSize: addUnit(size[props.textSize], 'px'),
				...defaultCommonTextStyle,
				color,
				fontWeight: props.fontBold || defaultCommonTextStyle.fontWeight
			},
			props.prefixStyle
		)
	)
})

const integerTextStyle = computed(() => {
	const size = { small: 12, middle: 16, large: 24 }
	const color = props.textColor || defaultCommonTextStyle.color
	return addStyle(
		Object.assign(
			{
				fontSize: addUnit(size[props.textSize], 'px'),
				...defaultCommonTextStyle,
				color,
				fontWeight: props.fontBold || defaultCommonTextStyle.fontWeight
			},
			props.integerStyle
		)
	)
})

const decimalsTextStyle = computed(() => {
	const size = { small: 10, middle: 11, large: 12 }
	const color = props.textColor || defaultCommonTextStyle.color
	return addStyle(
		Object.assign(
			{
				fontSize: addUnit(size[props.textSize], 'px'),
				...defaultCommonTextStyle,
				color,
				fontWeight: props.fontBold || defaultCommonTextStyle.fontWeight
			},
			props.prefixStyle
		)
	)
})
</script>
<style lang="scss" scoped>
/* #ifndef APP-NVUE */
.inline-block {
	display: inline-block;
}
.align-bottom {
	vertical-align: bottom;
}
/* #endif */
/* #ifdef APP-NVUE */
.price-text {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
}
/* #endif */
</style>
