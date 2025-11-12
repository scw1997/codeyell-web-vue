<script setup lang="ts">
console.log('Swico全局变量', SWICO_PUBLIC_PATH, SWICO_ROUTER_BASE, SWICO_ENV);

const publicPath = SWICO_PUBLIC_PATH;
const routerBase = SWICO_ROUTER_BASE;
const env = SWICO_ENV;
</script>

<template>
    <div>1111</div>
</template>
<style scoped>
.loading-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
