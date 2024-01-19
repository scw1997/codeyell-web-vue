<script setup lang="ts">
const props = defineProps<{ a: number }>();
const { a } = props;
const emits = defineEmits<{ (e: 'test'): void }>();
</script>
<template>
    {{ a }}
</template>

<style scoped></style>
