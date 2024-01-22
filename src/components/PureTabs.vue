<!--纯Tabs组件（不含tab内容）-->
<script setup lang="ts">
import { ref, toRefs, watch, watchEffect } from 'vue';

export type TabConfigItem = {
    name: string;
    key: string;
};

interface PropsType {
    config: TabConfigItem[];
    defaultActiveKey?: TabConfigItem['key'];
    activeKey?: TabConfigItem['key'];
}

const props = defineProps<PropsType>();
const { config, activeKey, defaultActiveKey } = toRefs(props);
const emits = defineEmits<{
    change: [key: TabConfigItem['key']];
}>();
const activeKeyState = ref<typeof defaultActiveKey.value>(
    activeKey.value ?? defaultActiveKey.value
);

const handleTabClick = (item: TabConfigItem) => {
    //没有传activeKey prop则可以内部切换activeKeyState，否则以activeKey prop为准
    if (!activeKey.value) {
        activeKeyState.value = item.key;
    }
    emits('change', item.key);
};

watch(
    activeKey,
    (value, oldValue, onCleanup) => {
        if (value) {
            activeKeyState.value = value;
        }
    }
    // { immediate: true }
);
</script>

<template>
    <div class="pure-tabs-component-root">
        <section
            v-for="(item, index) in config"
            :key="index"
            :class="{ 'tab-item': true, active: activeKeyState === item.key }"
        >
            <div class="name" @click="handleTabClick(item)">{{ item.name }}</div>
        </section>
    </div>
</template>

<style scoped lang="less">
.pure-tabs-component-root {
    display: flex;
    justify-content: space-between;
    height: 100%;

    .tab-item {
        font-size: 18px;

        &.active {
            border-bottom: 2px solid #268cfc;
            color: #268cfc;
        }

        .name {
            cursor: pointer;
        }
    }
}
</style>
