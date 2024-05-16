<script setup lang="ts">
import { onErrorCaptured, onMounted, ref } from 'vue';
import { Result } from 'ant-design-vue';
const error = ref<string | null>(null);

onErrorCaptured((err, instance, info) => {
    error.value = err.toString();
    console.error(err);
    return false;
});
</script>

<template>
    <Result v-if="!!error" status="error" title="页面出错了" :subTitle="error" />
    <template v-else>
        <slot></slot>
    </template>
</template>

<style scoped lang="less"></style>
