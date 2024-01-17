<script setup lang="ts">
import { useAttrs } from 'vue';
const props = defineProps<{ a: number }>();
const { a } = props;
const emits = defineEmits<{ (e: 'test'): void }>();
</script>
<template>
    {{ a }}
    <AButton
        @click="
            () => {
                emits('test', (res) => {
                    //如果父组件使用了test这个事件，则一定会触发此callback函数调用，可通过此判断
                    //通过次callback函数调用传递事件的返回值，emits本身调用无返回值
                    console.log('callback调用返回值', res);
                });
            }
        "
    >
        点我
    </AButton>
</template>

<style scoped></style>
