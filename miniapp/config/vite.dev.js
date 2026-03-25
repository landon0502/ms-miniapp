import { mergeConfig, defineConfig, loadEnv } from 'vite'
import baseConfig from './vite.base'

function getProxy(mode) {
	const env = loadEnv(mode, process.cwd())
	return {
		'/api': {
			target: env.VITE_API_BASE_URL,
			changeOrigin: true,
			pathRewrite: {}
		}
	}
}

export default defineConfig(async (...args) => {
	const baseConf = await baseConfig(...args)
	const { mode } = args[0]
	return mergeConfig(baseConf, {
		build: {
			target: 'es6', // 根据你需要兼容的浏览器版本进行调整:cite[2]
			sourcemap: true
		},
		server: {
			proxy: getProxy(mode)
		}
	})
})
