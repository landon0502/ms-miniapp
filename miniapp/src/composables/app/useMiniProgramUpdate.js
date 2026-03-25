// 微信小程序更新提示 Hook
export default function useMiniProgramUpdate() {
	if (uni.canIUse('getUpdateManager')) {
		const updateManager = uni.getUpdateManager()

		// 新版本下载完成
		updateManager.onUpdateReady(() => {
			uni.showModal({
				title: '更新提示',
				content: '检测到新版本，是否重启应用？',
				success: (res) => {
					if (res.confirm) {
						updateManager.applyUpdate()
					}
				}
			})
		})

		// 下载失败
		updateManager.onUpdateFailed(() => {
			uni.showModal({
				title: '更新失败',
				content: '新版本下载失败，请检查网络',
				showCancel: false
			})
		})
	}
}
