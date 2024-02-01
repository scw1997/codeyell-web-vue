<script setup lang="ts"></script>

<template>
    <div class="global-spin-container">
        <ASpin class="global-spin" size="large" spinning tip="加载中" />
    </div>
</template>

<style scoped lang="less">
.global-spin-container {
    width: 100%;
    height: 100%;

    :deep(.global-spin) {
        position: relative;
        height: 100%;
        width: 100%;

        .ant-spin-dot {
            position: absolute;
            inset: 0 0 0 0;
            margin: auto;
        }

        .ant-spin-text {
            width: max-content;
            height: max-content;
            position: absolute;
            inset: 0 0 0 0;
            margin: auto;
            padding-top: 60px;
        }
    }
}
</style>
