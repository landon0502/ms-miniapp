export default function useNetworkStatus() {
	uni.onNetworkStatusChange(function (res) {
		if (!res.isConnected) {
			uni.showToast({
				title: '网络异常，请检查网络',
				icon: 'none'
			})
		}
	})
}
