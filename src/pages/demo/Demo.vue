<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { useLocation, Link } from 'swico';
import { RouterLink } from 'vue-router';
const { name } = useLocation();

const click = () => {
    const { history } = Swico;
    console.log('xxx', history.location);
};
</script>

<template>
    <AButton @click="click">选项</AButton>
</template>

<style scoped></style>
