<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { history } from 'swico';
console.log('history', history.location);

const click = () => {
    // console.log('xxx', history.location);
    history.push({ name: 'project-list' });
};
</script>

<template>
    <AButton @click="click">选项</AButton>
</template>

<style scoped></style>
