<script setup lang="ts">
import { Link } from 'swico/vue';

console.log('Swico全局变量', SWICO_PUBLIC_PATH, SWICO_ROUTER_BASE, SWICO_ENV);

const publicPath = SWICO_PUBLIC_PATH;
const routerBase = SWICO_ROUTER_BASE;
const env = SWICO_ENV;
</script>

<template>
    <Link :to="{ name: 'demo1' }">
demo1
</Link>
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
