<script setup lang="ts">
import { useCssModule } from 'vue';

const style = useCssModule('module1');
console.log('style', style);
</script>

<template>
    <div :class="style.welcome">
        <img alt="logo" src="/logo.png" />
        <h2 style="color: #3a95a7">
Welcome to Swico
</h2>
    </div>
</template>

<style module="module1" lang="less">
.welcome {
    inset: 0 0 0 0;
    position: absolute;
    width: 100%;
    height: max-content;
    margin: auto;
    text-align: center;
}
</style>
