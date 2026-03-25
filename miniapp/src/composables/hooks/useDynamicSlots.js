import { useSlots, computed } from 'vue'
import { isEmpty } from 'lodash'

export const parentComponentKey = Symbol('parent_slot_component_key')

export default function useDynamicSlotKeys(options) {
	const { slotNames = [] } = options ?? {}
	const slots = useSlots()
	const filterCanuseSlotName = (slot) => {
		return (isEmpty(slotNames) || slotNames.includes(slot.name)) && slot.isRender
	}

	function genCanRenderSlot({ name, render }) {
		let renderSlot = {
			name,
			render,
			isRender: false
		}
		// #ifdef MP-WEIXIN
		renderSlot.isRender = render
		// #endif
		// #ifndef MP-WEIXIN
		renderSlot.isRender = !isEmpty(render())
		// #endif
		return renderSlot
	}

	const dynamicSlots = computed(() => {
		return Object.entries(slots)
			.reduce((acc, [slotName, render]) => {
				return [...acc, genCanRenderSlot({ name: slotName, render })]
			}, [])
			.filter(filterCanuseSlotName)
	})
	return { slots: dynamicSlots }
}
