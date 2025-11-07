<script setup lang="ts">
import { useCssModule } from 'vue';
import { Link } from 'swico';

const style = useCssModule('module1');
console.log('style', style);
</script>

<template>
    <div class="m-2">
        <img alt="logo" src="/logo.png" />
        <h2 style="color: #3a95a7">
Welcome to Swico
</h2>
        <Link :to="{ name: 'demo1', query: { a: '1' } }">
2323
</Link>
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
