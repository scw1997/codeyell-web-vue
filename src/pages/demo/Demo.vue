<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { history, useNav } from 'swico';
const nav = useNav();
const click = () => {
    // console.log('xxx', history.location);
    // nav({ name: 'demo1', state: { d: 1, c: 2 } });
    history.push({ name: 'demo1', state: { d: 1, e: 3 } });
};
</script>

<template>
    <AButton @click="click">Demo</AButton>
</template>

<style scoped></style>
