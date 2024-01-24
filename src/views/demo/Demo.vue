<script setup lang="ts">
import { defineComponent, ref } from 'vue';

const comp1 = defineComponent({
    template: '<div><input/>1</div>'
});
const comp2 = defineComponent({
    template: '<div><input/>2</div>'
});

const comp = ref(1);
</script>

<template>
    <button @click="comp = comp === 1 ? 2 : 1">切换</button>
    <KeepAlive>
        <input v-if="comp === 1" />

        <input v-else />
    </KeepAlive>
    <span>{{ comp }}</span>
</template>

<style scoped lang="less"></style>
