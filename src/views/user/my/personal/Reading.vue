<script setup lang="ts">
import { ref, watch } from 'vue';
import { ProjectItem, Pagination } from '@/components';
import { Empty } from 'ant-design-vue';
import api from '@/api';

interface PropsType {
    userId?: string; //查询的对应用户id，不传表示登录用户
}

interface StatesType {
    proList: any[]; //当前页项目列表数据
    proParams: Record<string, any>; //获取项目列表数据的参数
}

const props = defineProps<PropsType>();

const states = ref<StatesType>({
    proList: [],
    proParams: props.userId ? { user_id: props.userId } : {}
});

watch([() => states.value.proList], (newValue) => {
    console.log('proList', newValue);
});
</script>

<template>
    <div class="personal-reading-root">
        <div v-for="(proItem, index) in states.proList" class="pb" :key="index">
            <ProjectItem class="pb" :data="proItem" :type="!!userId ? 'public' : 'my'" />
            <!--            <div>111</div>-->
        </div>

        <Empty
            v-if="states.proList.length === 0"
            description="暂无项目"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
        />

        <Pagination
            class="mt"
            @change="
                (data) => {
                    states.proList = data;
                }
            "
            :params="states.proParams"
            :url="api.user.getMyProList"
        />
    </div>
</template>

<style scoped lang="less"></style>
