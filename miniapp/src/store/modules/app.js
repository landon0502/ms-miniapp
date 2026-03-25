import { defineStore } from 'pinia'
import { isDev } from '@/contants'
import Storage from '@/utils/Storage'

const store = new Storage()
const envStorageKey = '__CURRENT_DEV_ENV__'
export const useAppStore = defineStore('app', {
	state: () => ({
	}),
	getters: {
		isDev() {
			return isDev
		},
		appName() {
			return import.meta.env.VITE_APP_NAME
		},
		appVersion() {
			return import.meta.env.VITE_APP_VERSION
		}
	},
	actions: {
		
	}
})
