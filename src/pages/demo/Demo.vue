<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { useLocation, Link } from 'secywo-template-cli';
import { RouterLink } from 'vue-router';
const { name } = useLocation();

const text = ref('xxx');
console.log('name', name);
const click = () => {
    Secywo.history.push({ name: 'project-list', hash: '#dddd' });
};
</script>

<template>
    <Link to="/" class="xx" style="color: red">{{ text }}</Link>
    <AButton @click="text = 'yyy'">选项</AButton>
</template>

<style scoped></style>
