<script setup lang="ts">
import { ref } from 'vue';
import { NoteItem, Pagination } from '@/components';

import { Empty } from 'ant-design-vue';
import api from '@/api';

interface PropsType {
    userId?: string; //查询的对应用户id，不传表示登录用户
}

interface StatesType {
    noteList: any[]; //当前页注解列表数据
    noteParams: Record<string, any>; //获取注解列表数据的参数
}
const props = defineProps<PropsType>();

const states = ref<StatesType>({
    noteList: [],
    noteParams: props.userId ? { user_id: props.userId } : {}
});
</script>

<template>
    <div class="personal-reading-root">
        <NoteItem
            v-for="(proItem, index) in states.noteList"
            class="pb"
            :data="proItem"
            :key="index"
            type="user"
        />

        <AEmpty
            v-if="states.noteList.length === 0"
            description="暂无数据"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
        />
        <Pagination
            class="mt"
            @change="
                (data) => {
                    states.noteList = data;
                }
            "
            :params="states.noteParams"
            :url="api.user.getMyNoteList"
        />
    </div>
</template>

<style scoped lang="less"></style>
