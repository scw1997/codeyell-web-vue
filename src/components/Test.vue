<script setup lang="ts">
import { authFunc } from '@/utils/tools';
import { defineComponent, h, ref, watch, watchEffect } from 'vue';
import { Modal, Space, Textarea } from 'ant-design-vue';

// const props = defineProps<{ a: number }>();
// const { a } = props;
// const emits = defineEmits<{ (e: 'test'): void }>();

const a = ref(1);
const click = () => {
    a.value = 2;
    a.value = 3;
    a.value = 4;
};

watch(a, () => {
    console.log('value1', a.value);
});

watchEffect(() => {
    console.log('value2', a.value);
});
</script>
<template><button @click="click">xxxx</button></template>

<style scoped></style>
