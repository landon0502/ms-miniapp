import { createPinia } from 'pinia'
import { defineThemeConfig } from './uv.config'
import { createSSRApp } from 'vue'
import App from './App.vue'
import uvUI from '@/uni_modules/uv-ui-tools'
import { initRequest } from '@/utils/request'
import { useNetworkStatus } from '@/composables'
import { pageMap, globalConfig } from '@/config/pages.mjs';
import 'virtual:uno.css'
export function createApp() {
	const app = createSSRApp(App)
	app.use(uvUI)
	app.use(createPinia())
	defineThemeConfig()
	initRequest()
	useNetworkStatus()
	uni.$pagesConfig = {
		pages: pageMap,
		...globalConfig
	}
	return {
		app
	}
}
