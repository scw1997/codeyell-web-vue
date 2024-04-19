<script setup lang="ts">
import {
    Avatar,
    Button,
    Card,
    Col,
    ConfigProvider,
    Dropdown,
    Empty,
    Form,
    Image,
    Input,
    Layout,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Tabs,
    Tag,
    Tooltip,
    Upload
} from 'ant-design-vue';
import { createPinia, storeToRefs } from 'pinia';

import zhCN from 'ant-design-vue/locale/zh_CN';
import { PureTabs } from '@/components';
import { useLocation, Outlet } from 'swico';
import useGlobalStore from '@/store/global';
import { UserOutlined } from '@ant-design/icons-vue';
import { processOSSLogo } from '@/utils/tools';
import { history } from 'swico';

import { watch, ref, toRefs, watchEffect, reactive } from 'vue';

import Loading from '@/components/Loading.vue';
import { App as AntdApp } from 'ant-design-vue/es/components';

const { Header, Content, Footer } = Layout;

const route = useLocation();

const { userInfo } = storeToRefs(useGlobalStore());

const navTabConfig = [
    {
        name: '首页',
        key: 'home'
    },
    {
        name: '项目',
        key: 'project-list'
    },
    {
        name: '排行榜',
        key: 'user-rank'
    }
];

const jumpToIndex = () => {
    history.push({ name: 'home' });
};
const handleSearch = (value: string) => {
    //跳转搜索结果页
    history.push({ name: 'project-search', query: { keyword: value } });
};

const handleTabChange = (key) => {
    history.push({ name: key });
};

const handleAvatarClick = () => {
    history.push({ name: 'my-personal' });
};
</script>

<template>
    <template v-if="route.name">
        <AConfigProvider :locale="zhCN" v-if="route.name === 'project-read'">
            <AApp className="layout-app">
                <Outlet />
            </AApp>
        </AConfigProvider>
        <AConfigProvider :locale="zhCN" v-else>
            <AApp>
                <Layout class="page-layout">
                    <Header class="layout-header">
                        <main class="layout-main">
                            <section class="item logo-text">
                                <span class="logo cp" @click="jumpToIndex"></span>
                                <span class="text cp" @click="jumpToIndex">CodeYell</span>
                            </section>
                            <section class="item nav-bar">
                                <PureTabs
                                    :activeKey="route.name"
                                    :config="navTabConfig"
                                    @change="
                                        (key) => {
                                            handleTabChange(key);
                                        }
                                    "
                                />
                            </section>
                            <AInputSearch
                                allowClear
                                class="item search-bar"
                                maxLength="50"
                                @search="handleSearch"
                                placeholder="搜索项目"
                            />

                            <section class="item register-login">
                                <ASpace size="middle">
                                    <AAvatar
                                        v-if="!!userInfo"
                                        class="avatar cp"
                                        @click="handleAvatarClick"
                                        :size="40"
                                        shape="square"
                                        :src="processOSSLogo(userInfo?.avatar, true) || null"
                                    >
                                        <template #icon>
                                            <UserOutlined />
                                        </template>
                                    </AAvatar>

                                    <template v-else>
                                        <span
                                            class="cp"
                                            @click="
                                                () => {
                                                    history.push({
                                                        name: 'auth-login',
                                                        query:
                                                            route.name === 'home'
                                                                ? {}
                                                                : {
                                                                      redirect_path:
                                                                          encodeURIComponent(
                                                                              route.path +
                                                                                  route.query
                                                                          )
                                                                  }
                                                    });
                                                }
                                            "
                                        >
                                            登录
                                        </span>
                                        <span
                                            class="cp"
                                            @click="
                                                () => {
                                                    history.push({ name: 'auth-login' });
                                                }
                                            "
                                        >
                                            注册
                                        </span>
                                    </template>

                                    <ASelect
                                        defaultValue="chinese"
                                        :options="[
                                            {
                                                value: 'chinese',
                                                label: '中文'
                                            },
                                            {
                                                value: 'english',
                                                label: 'English'
                                            }
                                        ]"
                                        style="width: 120px"
                                    />
                                </ASpace>
                            </section>
                        </main>
                    </Header>
                    <Content class="layout-content">
                        <main class="layout-main">
                            <Outlet />
                        </main>
                        <Footer class="layout-footer">
                            <main class="layout-main">
                                <span class="logo"></span>
                                <ASpace class="item text" size="large">
                                    <span>
                                        邮箱：
                                        <a href="mailto:i@lifang.biz">i@lifang.biz</a>
                                    </span>
                                    <span>@2024 西安立方网络科技有限公司</span>
                                    <span>
                                        <a
                                            href="https://beian.miit.gov.cn"
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            陕ICP备15013641号-10
                                        </a>
                                    </span>
                                </ASpace>
                            </main>
                        </Footer>
                    </Content>
                </Layout>
            </AApp>
        </AConfigProvider>
    </template>

    <Loading v-else />
</template>

<style scoped lang="less">
.page-layout {
    min-width: max-content;

    .layout-main {
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: space-between;
        margin: 0 auto;
        width: 1200px;
        padding: 0 20px;

        .item {
            height: 100%;
        }
    }

    .layout-header {
        padding: 0;
        background-color: #fff;
        height: 70px;
        position: sticky;
        top: 0;
        z-index: 2;

        .logo-text {
            flex: 2;

            .text {
                vertical-align: middle;
                font-size: 20px;
                padding-left: 20px;
                color: rgba(16, 16, 16, 1);
            }
        }

        .nav-bar {
            flex: 2;
        }

        .search-bar {
            flex: 4;
            display: flex;
            justify-content: center;
            align-items: center;

            :deep(.ant-input-wrapper) {
                width: 250px;
            }
        }

        .register-login {
            flex: 3;
            display: contents;
            justify-content: right;
            align-items: end;
        }
    }

    .layout-content {
        & > .layout-main {
            padding: 30px 20px;
            min-height: calc(100vh - 170px);
            justify-content: center;
        }
    }

    .layout-footer {
        padding: 0;
        height: 100px;
        background-color: #000;

        .text {
            color: #868a8e;
        }
    }
}

.layout-app {
    width: 100%;
    height: 100%;
}
</style>
