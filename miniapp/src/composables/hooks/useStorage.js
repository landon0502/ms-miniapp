import { ref } from 'vue'
import Storage from '@/utils/Storage'
import { noop } from 'lodash'
export default function useLocalStoreSate(key, options) {
	const storage = new Storage()
	const storageValue = ref(storage.getItem(key) || options.defaultValue)
	const {
		listenStorageChange = false,
		onChange = noop,
		onError = noop,
		onRemove = noop,
		onClear = noop
	} = options ?? {}

	storage.listener('change', (value) => {
		if (key === value.key) {
			storageValue.value = value.data
			if (listenStorageChange) {
				onChange(value)
			}
		}
	})
	storage.listener('error', (error) => {
		onError(error)
	})

	storage.listener('remove', (e) => {
		onRemove(e)
	})

	storage.listener('clear', (e) => {
		onClear(e)
	})
	return {
		data: storageValue,
		storage,
		setItem(value, options) {
			return storage.setItem(key, value, options)
		},
		getItem(options) {
			return storage.getItem(key, options)
		}
	}
}
