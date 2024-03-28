<script setup>
import { onMounted, ref } from 'vue';

const { history } = Secywo;
onMounted(() => {
    history.push({ name: 'article-list', hash: 'dddd' });
});
</script>

<template>demo</template>

<style scoped></style>
