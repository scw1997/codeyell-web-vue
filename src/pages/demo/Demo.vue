<script setup>
import { defineComponent, onMounted, ref } from 'vue';
import { history, useNav } from 'swico';
const nav = useNav();
onMounted(() => {
    // @ts-ignore
});

console.log('history1', a.b);

const click = () => {
    history.push({ name: 'demo1', state: { d: 1, e: 3 } });
};
</script>

<template>
    <AButton @click="click">
        <span>Demo</span>
    </AButton>
</template>

<style scoped lang="scss">
span {
    color: red;
}
</style>
