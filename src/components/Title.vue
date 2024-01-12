<script setup lang="ts">
import { onMounted } from 'vue';
interface TitleProps {
    value: string;
}

const props = defineProps<TitleProps>();

onMounted(() => {
    document.title = props.value;
});
</script>

<template>
    {{ null }}
</template>

<style scoped></style>
