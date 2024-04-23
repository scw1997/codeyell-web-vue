<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { history, useNav } from 'swico';
const nav = useNav();
const click = () => {
    // console.log('xxx', history.location);
    nav({ name: 'project-list', query: { d: 1 } });
};
</script>

<template>
    <AButton @click="click">选项</AButton>
</template>

<style scoped></style>
