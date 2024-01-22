<script setup lang="ts">
import { authFunc } from '@/utils/tools';
import { h, nextTick, ref, toRefs, watch, watchEffect, withDefaults } from 'vue';
import { Modal, Space, Textarea, InputNumber } from 'ant-design-vue';
import http from '@/utils/http';
//分页器业务组件
interface PropsType {
    url: string; //请求数据的接口
    params?: Record<string, any> | null; //请求数据的接口参数（不含offset）
    isReady?: boolean; //是否可以开始获取数据（用于控制获取初始数据的时机）
}

interface StatesType {
    curPageNo: number; //当前页码
    targetPageNo: number; //目标页码
    isFinish: boolean; //是否实际最大页码值已访问过,即后续访问最大页码时不能再点下一页
    limit: number; //当前接口每页返回条数
}

const props = withDefaults(defineProps<PropsType>(), { isReady: true, url: '', params: null });
const emits = defineEmits<{
    change: [data: any[]]; //列表数据改变回调
}>();

const states = ref<StatesType>({
    curPageNo: 1,
    isFinish: true,
    limit: 10,
    targetPageNo: 1
});

const getData = async (pageNo: number) => {
    if (!props.isReady) return;

    const offset = pageNo === 1 ? 0 : (pageNo - 1) * states.value.limit;
    const data = await http.post(props.url, {
        ...props.params,
        offset
    });
    const pageLimit = data?.limit || 10;
    const list = data?.list || [];
    states.value = {
        curPageNo: pageNo,
        isFinish: list.length < pageLimit,
        limit: pageLimit,
        targetPageNo: pageNo
    };
    emits('change', list);
    return list;
};

defineExpose({
    pageNo: states.value.curPageNo,
    getData
});

watch(
    [() => props.params],
    async (newValue) => {
        if (newValue) {
            states.value = {
                ...states.value,
                curPageNo: 1,
                isFinish: true
            };
            await nextTick();
            getData(1);
        }
    },
    { immediate: true }
);
</script>
<template>
    <ARow align="middle" class="pagination-component-root" justify="center">
        <ACol flex="none">
            <AButton
                :disabled="states.curPageNo === 1"
                @click="getData(states.curPageNo - 1)"
                type="link"
            >
                上一页
            </AButton>
            <AButton :disabled="states.isFinish" @click="getData(states.curPageNo + 1)" type="link">
                下一页
            </AButton>
            跳转到：第
            <InputNumber
                class="page-no-input"
                :min="1"
                @change="
                    (value) => {
                        states.targetPageNo = Number(value);
                    }
                "
                :value="states.targetPageNo"
            >
                <template #addAfter>
                    <span class="cp" @click="getData(states.targetPageNo)">确定</span>
                </template>
            </InputNumber>
            页
        </ACol>
    </ARow>
</template>

<style scoped></style>
