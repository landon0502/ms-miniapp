<template>
	<view
		class="app-tabbar bg-white overflow-hidden"
		:style="{ height: addUnit(tabbarHeight, 'px') }"
	>
		<uv-tabbar
			:value="activeIndex"
			@change="changeTabbar"
			:safeAreaInsetBottom="safeAreaInsetBottom"
			placeholder
			:zIndex="zIndex"
			:fixed="props.fixed"
		>
			<uv-tabbar-item
				v-for="tab in tabbarPages"
				:key="tab.url"
				:dot="tab.dot"
				:text="tab.name"
				:badge="tab.badge"
			>
				<template #inactive-icon>
					<uv-icon :name="tab.icon" :size="20"></uv-icon>
				</template>
				<template #active-icon>
					<uv-icon :name="tab.activeIcon" :size="20"></uv-icon>
				</template>
			</uv-tabbar-item>
		</uv-tabbar>
	</view>
</template>
<script setup name="Tabbar">
import { computed } from 'vue'
import { useRouter, useScreenInfo } from '@/composables'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
import TabbarProps from './props'
import { shoppingCart } from '@/store'
import home from '@/assets/images/home.png'
import homeActive from '@/assets/images/home-active.png'
import search from '@/assets/images/search.png'
import searchActive from '@/assets/images/search-active.png'
import stock from '@/assets/images/stock.png'
import stockActive from '@/assets/images/stock-active.png'
import user from '@/assets/images/user.png'
import userActive from '@/assets/images/user-active.png'
const { router, currentPage } = useRouter()

defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true
	}
	// #endif
})
const props = defineProps(TabbarProps.props)
const shoppingCartStore = shoppingCart.useShoppingCart()

const tabbarPages = computed(() => {
	return [
		{
			url: '/pages/index/index',
			icon: home,
			activeIcon: homeActive,
			dot: false,
			name: '首页'
		},
		{
			url: '/pages/goods/index',
			icon: search,
			activeIcon: searchActive,
			name: '找货'
		},
		{
			url: '/pages/shopping-cart/index',
			icon: stock,
			activeIcon: stockActive,
			dot: false,
			name: '进货单',
			badge: shoppingCartStore.cartNumber
		},
		{
			url: '/pages/user/index',
			icon: user,
			activeIcon: userActive,
			dot: false,
			name: '我的'
		}
	]
})
const activeIndex = computed(() => {
	return tabbarPages.value.findIndex(
		(item) => item.url === router.addRootPath(currentPage.value.route)
	)
})

const screen = useScreenInfo()
const tabbarHeight = computed(() => {
	if (props.safeAreaInsetBottom) {
		return screen.value.tabbarHeight
	}
	return screen.value.tabbarFixedHeight
})

const changeTabbar = (index) => {
	let url = tabbarPages.value[index]?.url
	router.tab({
		url
	})
}
</script>
<style scoped lang="scss">
.app-tabbar {
	:deep(.uv-border-top) {
		box-sizing: border-box;
		height: 50px;
	}
	:deep(.uv-tabbar) {
		height: 50px;
	}
	:deep(.uv-badge) {
		top: -5px !important;
		right: calc(50% - 8px) !important;
		transform: translateX(50%);
	}
}
</style>
