import { computed } from 'vue'
import { getMenuButtonBoundingClientRect, getWindowInfo } from '@/utils/sys'
export default function useScreenInfo() {
	const navbarFixedHeight = 44
	const tabbarFixedHeight = 50
	const { screenHeight, screenWidth, statusBarHeight, safeAreaInsets, windowWidth, windowHeight } =
		getWindowInfo()
	let info = computed(() => {
		let data = {
			tabbarFixedHeight,
			navbarFixedHeight,
			statusBarHeight,
			navbarHegiht: navbarFixedHeight + statusBarHeight,
			safeAreaInsetBottom: safeAreaInsets.bottom,
			safeAreaInsetTop: safeAreaInsets.top,
			tabbarHeight: tabbarFixedHeight + safeAreaInsets.bottom,
			safeWidth: screenWidth,
			screenHeight,
			menuBtnRect: getMenuButtonBoundingClientRect(),
			windowWidth,
			windowHeight
		}
		// 内容区高度
		data.pageContentHeight = screenHeight - data.navbarHegiht
		// 安全区内容高度
		data.safeAreaHeight = screenHeight - data.statusBarHeight - data.safeAreaInsetBottom
		return data
	})
	return info
}
