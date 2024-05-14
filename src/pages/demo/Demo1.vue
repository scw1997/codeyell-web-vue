<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { history, useNav, useLocation } from 'swico';
const location = useLocation();
console.log('state', location.state);
const click = () => {
    const { state } = history.location;
    // console.log('s', state);
    // nav({ name: 'project-list', query: { d: 1 } });
};
</script>

<template>
    <AButton @click="click">Demo1</AButton>
</template>

<style scoped></style>
