<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import CommentModal from '@/components/CommentModal.vue';

const text = ref('1');

interface Type {
    xxx(): void;
}
</script>

<template>
    <CommentModal v-model="text" type="drawer" :open="true" />
</template>

<style scoped lang="less"></style>
