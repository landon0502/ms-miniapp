import uni from '@dcloudio/vite-plugin-uni'
// import eslintPlugin from 'vite-plugin-eslint' // 导入插件
import pagesJsonGenerator from './plugins/pages-json-generator'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	const UnoCSS = (await import('unocss/vite')).default
	return {
		envPrefix: 'VITE_',
		// 其他配置...
		define: {
			// 可以将环境变量定义为全局常量（注意序列化）
		},
		plugins: [
			pagesJsonGenerator({
				mapPath: {
					development: 'src/config/pages.mjs',
					production: 'src/config/pages.mjs',
					wap: 'src/config/pages.wap.mjs'
				},
				mode
			}),
			uni(),
			UnoCSS({
				configFile: '../uno.config.js'
			})
		],
		build: {
			target: 'es6' // 根据你需要兼容的浏览器版本进行调整:cite[2]
		}
	}
})
