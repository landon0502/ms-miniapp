import { inject, onUnmounted } from 'vue'
import {
	provideNames,
	eventHookControlKeyName,
	hookNames,
	childrenComponentEvents
} from './context'
import { isFunction, noop } from 'lodash'

export default function usePopupContext({ key }) {
	// 注入组件方法，提供默认值
	const popupCancel = inject(provideNames.POPUP_CANCEL, noop)
	const popupClose = inject(provideNames.POPUP_CLOSE, noop)
	const popupConfirm = inject(provideNames.POPUP_CONFIRM, noop)
	const popupOnConfirm = inject(provideNames.ON_CONFIRM, noop)
	const setFooterConfig = inject(provideNames.SET_FOOTER_CONFIG, noop)
	const eventController = inject(eventHookControlKeyName, {})

	/**
	 * 注册弹窗事件钩子
	 * @param {String} eventName - 事件名称
	 * @param {Function} callback - 事件回调函数
	 */
	const registerEventHooks = (eventName, callback) => {
		if (isFunction(callback)) {
			eventController[key] = eventController[key] || {}
			eventController[key][eventName] = callback
		}
	}

	/**
	 * 弹出事件监听
	 */
	const listener = {
		// 打开时
		onOpen: (callback) => registerEventHooks(hookNames.ON_POPUP_OPEN, callback),
		//关闭时
		onClose: (callback) => registerEventHooks(hookNames.ON_POPUP_CLOSE, callback),
		// 关闭前
		onPopupBeforeClose: (callback) => registerEventHooks(hookNames.ON_POPUP_BEFORE_CLOSE, callback),
		// 点击取消时
		onPopupCancel: (callback) => registerEventHooks(hookNames.ON_POPUP_CANCEL, callback),
		// 取消前
		onPopupBeforeCancel: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CANCEL, callback),
		// 点击确认时
		onPopupConfirm: (callback) => registerEventHooks(hookNames.ON_POPUP_CONFIRM, callback),
		// 确认前
		onPopupBeforeConfirm: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CONFIRM, callback),
		// 确认前校验，返回false时不可关闭
		onPopupBeforeConfirmValidate: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CONFIRM_VALIDATE, callback)
	}

	onUnmounted(() => {
		// 卸载时清除事件
		delete eventController[key] // 只清除当前 key 下的事件
		uni.$emit(childrenComponentEvents.ON_UNLOAD, { key })
	})

	function init() {
		uni.$emit(childrenComponentEvents.ON_LOAD, { key })
	}
	init()

	return {
		popupCancel,
		popupClose,
		popupConfirm,
		popupOnConfirm,
		setFooterConfig,
		listener
	}
}
