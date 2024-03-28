<script setup lang="ts">
import { useLocation } from 'secywo-template-cli';
import { Title, PureTabs, Pagination } from '@/components';
import { Radio, RadioGroup, RadioButton, Empty, Card } from 'ant-design-vue';
import { Component, onMounted, ref, h, watch, watchEffect } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import api from '@/api';
import { TabConfigItem } from '@/components/PureTabs.vue';
import http from '@/utils/http';
import MyPersonalReading from '@/pages/user/my/personal/MyPersonalReading.vue';
import MyPersonalNotes from '@/pages/user/my/personal/MyPersonalNotes.vue';
import { processOSSLogo } from '@/utils/tools';

interface StatesType {
    tabConfig: TabConfigItem[];
    activeKey: TabConfigItem['key'];
    mainContent: Component | null;
}
const route = useLocation();
const { history } = Secywo;
const userId = route.query.id;

const states = ref<StatesType>({
    tabConfig: [
        {
            name: '在读',
            key: 'read'
        },
        {
            name: '注解',
            key: 'note'
        }
    ],
    activeKey: 'read',
    mainContent: null
});

const userStates = ref<Record<string, any> | null>(null); //当前指定用户的基本信息

//未携带用户id参数
if (!userId) {
    history.replace({ name: '404' });
}

const handleTabChange = (key: string) => {
    states.value.activeKey = key;
};

const getUserData = async () => {
    const userData = await http.post(api.user.getMyData, { user_id: userId });

    states.value.tabConfig = [
        {
            name: `在读(${userData?.count_project || 0})`,
            key: 'read'
        },
        {
            name: `注解(${userData?.count_comment || 0})`,
            key: 'note'
        }
    ];

    userStates.value = userData;
};
onMounted(() => {
    getUserData();
});

watch(
    () => states.value.activeKey,
    (newActiveKey) => {
        states.value.mainContent =
            newActiveKey === 'read'
                ? h(Card, { class: 'main-card' }, [
                      h(MyPersonalReading, { userId: userId as string })
                  ])
                : h(Card, { class: 'main-card' }, [
                      h(MyPersonalNotes, { userId: userId as string })
                  ]);
    },
    { immediate: true }
);
</script>
<template>
    <div class="user-public-page-root">
        <Title value="用户资料 - 源码阅读交流平台" />
        <section class="left-card">
            <ACard class="tab-card mb">
                <PureTabs
                    :activeKey="states.activeKey"
                    class="pure-tabs"
                    :config="states.tabConfig"
                    @change="handleTabChange"
                />
            </ACard>

            <ACard class="main-card">
                <KeepAlive>
                    <MyPersonalReading v-if="states.activeKey === 'read'" />
                    <MyPersonalNotes v-else />
                </KeepAlive>
            </ACard>
        </section>

        <section class="right-side-container">
            <Card class="top-card mb">
                <div class="introduce mb">
                    <AAvatar
                        shape="square"
                        :size="50"
                        :src="processOSSLogo(userStates?.avatar, true) || null"
                    >
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </AAvatar>
                    <div class="main">
                        <p class="name">{{ userStates?.nickname || '昵称' }}</p>
                        <p class="description ellipsis">{{ userStates?.info || '介绍' }}</p>
                    </div>
                </div>

                <div class="statistics">
                    <section class="item">
                        <div class="amount">{{ userStates?.count_project || 0 }}</div>
                        <div class="name">在读</div>
                    </section>
                    <section class="item">
                        <div class="amount">{{ userStates?.count_comment || 0 }}</div>
                        <div class="name">注解</div>
                    </section>
                    <section class="item">
                        <div class="amount">{{ userStates?.count_liked || 0 }}</div>
                        <div class="name">被赞</div>
                    </section>
                </div>
            </Card>
        </section>
    </div>
</template>

<style scoped lang="less">
.user-public-page-root {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-self: flex-start;

    .left-card {
        flex: 4;
        padding-right: 20px;
        :deep(.tab-card) {
            .ant-card-body {
                padding-bottom: 0;
            }

            .pure-tabs {
                justify-content: flex-start;

                .tab-item {
                    height: 50px;
                    margin-right: 50px;
                }
            }
        }
    }

    .right-side-container {
        flex: 1;
        width: 0;

        .top-card {
            .introduce {
                display: flex;
                align-items: center;
                margin-bottom: 20px;

                .main {
                    padding-left: 14px;

                    p {
                        margin: 0;
                    }

                    .name {
                        font-size: 18px;
                    }
                }
            }

            .navs {
                .nav-item {
                    cursor: pointer;
                    padding: 12px 16px;
                    color: #868a8e;

                    .text {
                        font-size: 18px;
                    }

                    &.active {
                        background-color: #f7f7f7;
                        color: #2089fc;
                    }
                }
            }

            .statistics {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .item {
                    text-align: center;

                    .amount {
                        font-size: 24px;
                        font-weight: bold;
                        padding-bottom: 10px;
                    }

                    .name {
                        color: #626b7d;
                    }
                }
            }
        }
    }
}
</style>
