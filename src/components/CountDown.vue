<script setup lang="ts">
import { onMounted, reactive, ref, toRefs, useAttrs } from 'vue';
import dayjs from 'dayjs';
//倒计时组件
interface PropsType {
    initCount?: number; //初始时间，单位为秒
    text: string;
    beforeStart: () => Promise<boolean> | boolean; //点击按钮开始计时前的回调，返回true或promise<true>则开始计时
}
interface StatesType {
    count: PropsType['initCount'];
    btnDisabled: boolean;
    isCountdown: boolean;
}
const emits = defineEmits<{
    finish: [];
}>();

const props = defineProps<PropsType>();
const { initCount, text, beforeStart } = toRefs(props);

const statesRef = ref<StatesType>({
    count: initCount.value,
    btnDisabled: false,
    isCountdown: false
});

const createInterval = (endTime: dayjs.Dayjs) => {
    //定时器
    const timer = window.setInterval(() => {
        //获取当前时间与目标结束时间差值，单位ms
        const diff = endTime.diff(dayjs());

        if (diff <= 0 || !diff) {
            //重置状态
            statesRef.value = {
                count: initCount.value,
                btnDisabled: false,
                isCountdown: false
            };

            clearInterval(timer);
            sessionStorage.removeItem('timer');
            emits('finish');
        } else {
            //缓存本地，处理刷新页面的情况
            sessionStorage.setItem('timer', endTime.valueOf().toString());
            statesRef.value.count = Math.round(diff / 1000);
        }
    }, 1000);
};

const handleBtnClick = async () => {
    if (beforeStart.value) {
        //点击按钮回调方法返回true或值时则开始倒计时
        statesRef.value.btnDisabled = true;
        Promise.resolve(beforeStart.value())
            .then((res) => {
                if (res) {
                    const endTime = dayjs().add(initCount.value, 'second');
                    createInterval(endTime);
                    statesRef.value.isCountdown = true;
                } else {
                    statesRef.value.btnDisabled = false;
                }
            })
            .catch((e) => {
                statesRef.value.btnDisabled = false;
            });
    }
};
onMounted(() => {
    //有缓存时间，则走缓存，否则重新创建计时器
    const cacheEndTime = sessionStorage.getItem('timer');
    if (cacheEndTime) {
        const endTime = dayjs(Number(cacheEndTime));
        createInterval(endTime);
        statesRef.value = {
            count: Math.round(endTime.diff(dayjs()) / 1000),
            btnDisabled: true,
            isCountdown: true
        };
    }
});
</script>

<template>
    <div class="countdown-component-root">
        <AButton :disabled="statesRef.btnDisabled" @click="handleBtnClick" style="width: 100%">
            {{ statesRef.isCountdown ? `${statesRef.count}秒` : text }}
        </AButton>
    </div>
</template>

<style scoped></style>
