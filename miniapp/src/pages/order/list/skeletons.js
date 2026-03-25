import { Skeletons } from '@/components/PageContainer/skeletons'

function createSkeletons() {
	const skeletons = new Skeletons({
		marginTop: '16rpx'
	})

	for (let i = 0; i < 2; i++) {
		skeletons.add(
			skeletons.createBlock({
				style: {
					width: '100%',
					height: '420rpx',
					radius: '12rpx'
				}
			})
		)
		skeletons.gap('16rpx')
	}

	return skeletons.getConfig()
}
export default createSkeletons()
