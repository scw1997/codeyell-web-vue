<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'secywo-template-cli';
const router = useRouter();
onMounted(() => {
    router.push({ name: 'article-list', hash: 'dddd' });
});
</script>

<template>demo</template>

<style scoped></style>
