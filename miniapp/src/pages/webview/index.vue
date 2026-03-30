<template>
   <PageContainer fixedContentHeight :showNavBar="false">
        <web-view v-if="url" :src="url" class="w-full h-full"/>
   </PageContainer>
</template>
<script setup>
import { computed } from 'vue';
import { useRouter } from '@/composables';
import PageContainer from '@/components/PageContainer';
const { params }  = useRouter();
const url = computed(() => decodeURIComponent(params.value.url));
</script>