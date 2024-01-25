<script setup lang="ts">
import { Card } from 'ant-design-vue';
import Reading from '@/views/user/my/personal/MyPersonalReading.vue';
import Notes from '@/views/user/my/personal/MyPersonalNotes.vue';
import Integral from '@/views/user/my/personal/MyPersonalIntegral.vue';
import { useRoute, useRouter } from 'vue-router';
import { Title, PureTabs } from '@/components';
import type { TabConfigItem } from '@/components/PureTabs.vue';
import { Component, h, defineComponent, ref, watchEffect } from 'vue';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
const router = useRouter();
const route = useRoute();
const { query } = route;
const defaultTab = ['read', 'note', 'integral'].find((item) => item === query.tab) || 'read';
const globalStore = useGlobalStore();
const { userInfo } = storeToRefs(globalStore);

type StatesType = {
    tabConfig: TabConfigItem[];
    activeKey: TabConfigItem['key'];
};
// 定义各个模块的渲染组件

const componentMap: Record<'read' | 'note' | 'integral', Component> = {
    integral: Integral,
    read: h(Card, { class: 'main-card' }, [h(Reading)]),
    note: h(Card, { class: 'main-card' }, [h(Notes)])
};

const states = ref<StatesType>({
    tabConfig: [
        {
            name: '在读',
            key: 'read'
        },
        {
            name: '注解',
            key: 'note'
        },
        {
            name: '积分',
            key: 'integral'
        }
    ],
    activeKey: defaultTab
});

const handleTabChange = (key: string) => {
    states.value.activeKey = key;
};

watchEffect(() => {
    if (userInfo.value) {
        const { count_project, count_comment, count_point } = userInfo.value;
        states.value.tabConfig = [
            {
                name: `在读(${count_project || 0})`,
                key: 'read'
            },
            {
                name: `注解(${count_comment || 0})`,
                key: 'note'
            },
            {
                name: `积分(${count_point || 0})`,
                key: 'integral'
            }
        ];
    }
});
</script>
<template>
    <div class="personal-page-root">
        <Title value="个人中心 - 源码阅读交流平台" />
        <ACard class="tab-card mb">
            <PureTabs
                :activeKey="states.activeKey"
                class="pure-tabs"
                :config="states.tabConfig"
                @change="handleTabChange"
            />
        </ACard>
        <KeepAlive>
            <component :is="componentMap[states.activeKey]" />
        </KeepAlive>
    </div>
</template>

<style scoped lang="less">
.personal-page-root {
    .tab-card {
        :deep(.ant-card-body) {
            padding-bottom: 0;
        }

        :deep(.pure-tabs) {
            justify-content: flex-start;

            .tab-item {
                height: 50px;
                margin-right: 50px;
            }
        }
    }
}
</style>
