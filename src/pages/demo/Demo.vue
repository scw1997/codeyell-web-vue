<script setup>
import { onMounted, ref } from 'vue';
import { useLocation } from 'secywo-template-cli';
const { name } = useLocation();
console.log('name', name);
const click = () => {
    Secywo.history.push({ name: 'project-list', hash: '#dddd' });
};
</script>

<template><span @click="click">demo</span></template>

<style scoped></style>
