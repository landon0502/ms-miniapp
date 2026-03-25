<template>
	<uv-empty v-bind="props"> </uv-empty>
</template>
<script setup>
import emptyProps from '@/uni_modules/uv-empty/components/uv-empty/props'
const props = defineProps({
	...emptyProps.props,
	icon: {
		type: String,
		default: ''
	},
	width: {
		type: [String, Number],
		default: 190
	},
	height: {
		type: [String, Number],
		default: 134
	}
})
</script>
