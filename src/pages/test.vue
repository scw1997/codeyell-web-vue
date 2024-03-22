<script setup lang="ts">
import { ref } from 'vue';

const is = ref(false);
</script>

<template>
    我是Test
    <RouterView v-if="is" />
</template>

<style scoped lang="less"></style>
