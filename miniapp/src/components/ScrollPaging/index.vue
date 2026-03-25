<template>
	<view class="w-full h-full" :style="customStyle">
		<z-paging
			ref="pagingRef"
			refresher-only
			:fixed="false"
			:refresher-fixed-bac-height="props.refresherFixedBacHeight"
			:refresher-enabled="props.refresherEnabled"
			:refresher-threshold="props.refresherThreshold"
			show-refresher-when-reload
			@refresherStatusChange="onRefresherStatusChange"
			@scrolltolower="onScrolltolower"
			@scroll="onScroll"
		>
			<view class="w-full scroll-paging">
				<view class="w-full" v-if="loadingStatus">
					<slot name="loading" :status="loadingStatus">
						<view class="w-full h-150rpx flex justify-center items-center">
							<uv-loading-icon text="加载中" textSize="30rpx"></uv-loading-icon>
						</view>
					</slot>
				</view>

				<view class="scroll-view-content">
					<slot name="default"></slot>
				</view>
				<view
					class="scroll-view-empty w-full flex justify-center items-center mt-60rpx"
					v-if="showEmpty"
				>
					<slot name="empty">
						<Empty />
					</slot>
				</view>

				<template v-if="showLoadmore">
					<view class="load-more-view" :style="loadmoreStyle">
						<slot name="loadmore">
							<view class="w-full h-44px flex justify-center items-center">
								<uv-load-more
									:status="moreLoadingStatus"
									:loadmoreText="loadStatusText.loadmoreEnd"
								/>
							</view>
						</slot>
					</view>
				</template>
			</view>
		</z-paging>
	</view>
</template>
<script name="ScrollPaging" setup>
import { useToggle, useMergeModelValue } from '@/composables'
import { computed, reactive, ref, shallowRef, toRef } from 'vue'
import {
	ON_LOAD,
	ON_LOAD_MORE,
	ON_REFRESH,
	ON_SCROLL_TOLOWER,
	scrollPagingHooksEvents
} from './context'
import { isEmpty, isUndefined, isArray } from 'lodash'
import scrollPagingProps from './props'
import { genUuid } from '@/utils/utils'
import Empty from '../Empty'

// #ifdef MP-WEIXIN
defineOptions({
	styleIsolation: 'shared',
	multipleSlots: true,
	dynamicSlots: true // 启用动态 slot
})
// #endif

const props = defineProps(scrollPagingProps.props)
const emit = defineEmits({
	scroll: true,
	refresherpulling: true,
	refresherrefresh: true,
	refresherrestore: true,
	refresherabort: true,
	scrolltolower: true,
	loadmore: true
})
const pagingRef = shallowRef()
// 生成唯一的key作为useScrollPaging 标记
const scrollKey = genUuid()
// 上拉加载状态
const moreLoadingStatus = ref('loadmore')
// 是否显示loading
const loadingStatus = useMergeModelValue(() => props.loading, {
	defaultValue: false
})
// 刷新结束显示文本
const loadStatusText = reactive({
	loadmoreEnd: void 0
})
// 是否刷新失败
const isRefreshFail = ref(false)
// 是否强制显示空数据状态
const forceShowEmpty = ref(false)
// 空数据状态
const [emptyDataStatus, setEmptyDataStatus] = useToggle(false)
// 当前绑定数据
const data = toRef(props, 'data')
const mergeData = useMergeModelValue(data, {
	defaultValue: []
})

// 是否在刷新
const [refreshing, setRefreshStatus] = useToggle()

/**
 * 是否显示空状态
 */
const showEmpty = computed(() => {
	return (
		((emptyDataStatus.value || (isEmpty(mergeData.value) && !refreshing.value)) &&
			props.emptyEnable &&
			!props.refreshonly &&
			!props.emptyDisabled &&
			!loadingStatus.value) ||
		forceShowEmpty.value
	)
})

/**
 * 是否显示加载更多状态
 */
const showLoadmore = computed(() => {
	return (
		!refreshing.value &&
		!showEmpty.value &&
		props.loadmoreEnable &&
		!props.refreshonly &&
		mergeData.value.length >= (props.pageSize ?? 0)
	)
})

/**
 * 设置强制显示空状态
 */
const setForceShowEmptyStatus = (v) => (forceShowEmpty.value = v)

/**
 * 刷新
 */
const runRefresh = async () => {
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
	setEmptyDataStatus(false)
	setForceShowEmptyStatus(false)
	moreLoadingStatus.value = 'loadmore'
	setRefreshStatus(true)
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_REFRESH,
		callback: async () => {
			// 当仅使用刷新功能时在这里手动触发
			await refreshEnd()
		},
		onError() {
			refreshEnd()
		}
	})
}

/**
 * 手动刷新
 */
const refresh = async () => {
	if (!props.refresherEnabled) {
		return
	}
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
	setEmptyDataStatus(false)
	setForceShowEmptyStatus(false)
	moreLoadingStatus.value = 'loadmore'
	setRefreshStatus(true)
	pagingRef.value.refresh()
}

/**
 * 刷新状态改变
 */
const onRefresherStatusChange = (e) => {
	if (e === 'loading') {
		runRefresh()
	}
}

/**
 * 刷新结束
 */
const refreshEnd = async () => {
	setRefreshStatus(false)
	pagingRef.value.endRefresh()
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
}

/**
 * 重置刷新状态
 */
const complete = async (data = [], options = {}) => {
	const { pageTotal = props.pageTotal, pageSize = props.pageSize, notMore } = options
	if (isArray(data)) {
		mergeData.value = data
	}
	setEmptyDataStatus(isEmpty(mergeData.value) && !props.refreshonly)
	if (
		(!isUndefined(pageTotal) && mergeData.value.length === pageTotal) ||
		(!isUndefined(pageSize) && data.length < pageSize) ||
		(isEmpty(data) && !isEmpty(mergeData.value)) ||
		notMore
	) {
		completeByNoMore()
	} else {
		moreLoadingStatus.value = 'loadmore'
	}
}

/**
 * 没有更多
 */
const completeByNoMore = async () => {
	if (props.refreshonly) {
		return
	}
	moreLoadingStatus.value = 'nomore'
}

/**
 * 清除所有状态
 */
const clearState = () => {
	moreLoadingStatus.value = 'loadmore'
	loadStatusText.loadmoreEnd = void 0
	setRefreshStatus(false)
	setForceShowEmptyStatus(false)
}

/**
 * 滚动至底部触发
 */
const onScrolltolower = () => {
	emit('scrolltolower')
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_SCROLL_TOLOWER
	})
	if (moreLoadingStatus.value !== 'loadmore' || props.refreshonly) {
		return
	}
	emit('loadmore')
	moreLoadingStatus.value = 'loading'
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_LOAD_MORE,
		callback: () => {
			// 当仅使用触底加载功能时在这里手动触发
			// completeByNoMore()
		},
		onError() {
			clearState()
		}
	})
}

/**
 * 滚动监听
 */
const onScroll = (e) => {
	emit('scroll', e)
}

/**
 * 加载数据
 */
const runLoad = async () => {
	clearState()
	loadingStatus.value = true
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_LOAD,
		callback: async () => {
			// 当仅使用刷新功能时在这里手动触发
			loadingStatus.value = false
		},
		onError() {
			loadingStatus.value = false
		}
	})
}

/**
 * 下拉刷新事件
 */
const refreshEvt = {
	onRefresherPulling(e) {
		emit('refresherpulling', e)
	},
	onRefresherRefresh(e) {
		runRefresh()
		emit('refresherrefresh', e)
	},
	onRefresherRestore(e) {
		emit('refresherrestore', e)
	},
	onRefresherAbort(e) {
		refreshEnd()
		emit('refresherabort', e)
	}
}
refreshEvt
defineExpose({
	load: runLoad,
	refresh: () => {
		refresh()
	},
	complete,
	nomore: completeByNoMore,
	clearState,
	setForceShowEmptyStatus,
	moreLoadingStatus,
	loadingStatus,
	scrollKey,

	onLoadError() {
		loadingStatus.value = false
	},
	refreshErrorHandler(text) {
		if (text) {
			uni.showToast({ title: text, icon: 'none' })
		}
		isRefreshFail.value = true
		refreshEnd()
	},
	loadmoreErrorHandler(text) {
		loadStatusText.loadmoreEnd = text
		moreLoadingStatus.value = 'loadmore'
		clearState()
	}
})
</script>
<style scoped lang="scss">
.hide-scroll-bar {
	&::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
		background: transparent;
		color: transparent;
	}
}
</style>
