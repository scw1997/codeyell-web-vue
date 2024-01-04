<!--纯Tabs组件（不含tab内容）-->
<script setup lang="ts">
import { ref } from 'vue';

type TabConfigItem = {
    name: string;
    key: string;
};

interface PropsType {
    config: TabConfigItem[];
    defaultActiveKey?: TabConfigItem['key'];
    activeKey?: TabConfigItem['key'];
    onChange?: (key: TabConfigItem['key']) => void;
}

const { config, defaultActiveKey, activeKey, onChange } = defineProps<PropsType>();
const activeKeyRef = ref<typeof defaultActiveKey>(activeKey ?? defaultActiveKey);

const handleTabClick = (item: TabConfigItem) => {
    //没有传activeKey prop则可以内部切换activeKeyState，否则以activeKey prop为准
    if (!activeKey) {
        activeKeyRef.value = item.key;
    }
    onChange?.(item.key);
};
</script>

<template>
    <div class="pure-tabs-component-root">
        <section
            v-for="(index, item) in config"
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
