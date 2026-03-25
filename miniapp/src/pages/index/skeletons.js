import { Skeletons } from '@/components/PageContainer/skeletons'

function createSkeletons() {
	const skeletons = new Skeletons({
		marginTop: '24rpx'
	})
	skeletons.add(
		skeletons.createBlock({
			style: {
				width: '100%',
				height: '268rpx',
				radius: '8px'
			}
		})
	)

	skeletons.gap('24rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 2,
			cols: 5,
			style: {
				width: '100rpx',
				height: '100rpx',
				radius: '8px'
			}
		})
	)
	skeletons.gap('48rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 1,
			style: {
				width: '100%',
				height: '68px',
				radius: '8px'
			}
		})
	)
	skeletons.gap('24rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 2,
			style: {
				width: '348rpx',
				height: '68px',
				radius: '8px'
			}
		})
	)
	skeletons.gap('24rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 3,
			style: {
				width: '230rpx',
				height: '68px',
				radius: '8px'
			}
		})
	)
	skeletons.gap('48rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 5,
			style: {
				width: '135rpx',
				height: '30px',
				radius: '8px'
			}
		})
	)

	skeletons.gap('48rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 2,
			gap: 12,
			style: {
				width: 'full',
				height: '240px',
				radius: '8px'
			}
		})
	)
	return skeletons.getConfig()
}
export default createSkeletons()
