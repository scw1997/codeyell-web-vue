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

const props = withDefaults(defineProps<PropsType>(), { initCount: 60 });

const states = ref<StatesType>({
    count: props.initCount,
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
            states.value = {
                count: props.initCount,
                btnDisabled: false,
                isCountdown: false
            };

            clearInterval(timer);
            sessionStorage.removeItem('timer');
            emits('finish');
        } else {
            //缓存本地，处理刷新页面的情况
            sessionStorage.setItem('timer', endTime.valueOf().toString());
            states.value.count = Math.round(diff / 1000);
        }
    }, 1000);
};

const handleBtnClick = async () => {
    const { beforeStart, initCount } = props;
    if (beforeStart) {
        //点击按钮回调方法返回true或值时则开始倒计时
        states.value.btnDisabled = true;
        Promise.resolve(beforeStart())
            .then((res) => {
                if (res) {
                    const endTime = dayjs().add(initCount, 'second');
                    createInterval(endTime);
                    states.value.isCountdown = true;
                } else {
                    states.value.btnDisabled = false;
                }
            })
            .catch((e) => {
                states.value.btnDisabled = false;
            });
    }
};
onMounted(() => {
    //有缓存时间，则走缓存，否则重新创建计时器
    const cacheEndTime = sessionStorage.getItem('timer');
    if (cacheEndTime) {
        const endTime = dayjs(Number(cacheEndTime));
        createInterval(endTime);
        states.value = {
            count: Math.round(endTime.diff(dayjs()) / 1000),
            btnDisabled: true,
            isCountdown: true
        };
    }
});
</script>

<template>
    <div class="countdown-component-root">
        <AButton :disabled="states.btnDisabled" @click="handleBtnClick" style="width: 100%">
            {{ states.isCountdown ? `${states.count}秒` : text }}
        </AButton>
    </div>
</template>

<style scoped></style>
