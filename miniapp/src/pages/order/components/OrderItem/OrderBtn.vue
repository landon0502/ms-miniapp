<template>
	<uv-button
		type="default"
		size="small"
		@click="onClick"
		:text="props.text"
		:custom-style="{
			border: '1px solid #D9D9D9',
			borderRadius: '100rpx',
            padding: '8rpx 16rpx'
		}"
        :customTextStyle="{
            color: '#676767',
            fontSize: '12px'
        }"
	></uv-button>
</template>
<script setup>
const props = defineProps({
	text: {
		type: String,
		default: ''
	}
})
const emit = defineEmits(['click'])
const onClick = () => {
	emit('click')
}
</script>
