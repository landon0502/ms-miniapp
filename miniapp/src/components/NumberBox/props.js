import uvNumberBoxProps from '@/uni_modules/uv-number-box/components/uv-number-box/props'
import { omit } from 'lodash'

export default {
	props: {
		...omit(uvNumberBoxProps.props, ['buttonSize']),
		bgColor: {
			type: String
		},
		plusBtnStyle: Object,
		plusIconSize: {
			type: Number,
			default: 12
		},
		minusBtnStyle: Object,
		minusIconSize: {
			type: Number,
			default: 12
		},
		inputStyle: Object,
		inputHeight: Number
	}
}
