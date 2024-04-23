<script setup lang="ts">
import { processOSSLogo } from '@/utils/tools';
import allIcons, {
    UserOutlined,
    HomeOutlined,
    SettingOutlined,
    UserSwitchOutlined
} from '@ant-design/icons-vue';
import useGlobalStore from '@/store/global';
import { onMounted, toRefs, h } from 'vue';
import { useLocation, Outlet, useNav } from 'swico';
import { history } from 'swico';

const globalStore = useGlobalStore();
const { refreshMyData, clearUserCache } = globalStore;
const { userInfo } = toRefs(globalStore);
const { path, query, name: routeName } = toRefs(useLocation());
const nav = useNav();
const navList = [
    {
        icon: HomeOutlined,
        name: '个人首页',
        pathName: 'my-personal'
    },
    {
        icon: SettingOutlined,
        name: '账号设置',
        pathName: 'my-settings'
    },
    {
        icon: UserSwitchOutlined,
        name: '退出登录',
        pathName: 'auth-login'
    }
];

const handleGoPath = (pathName: string) => {
    if (pathName === 'auth-login') {
        clearUserCache();
    }
    nav({ name: pathName });
};

onMounted(() => {
    refreshMyData();
});
</script>

<template>
    <div class="user-home-layout">
        <section class="children-routes-container">
            <Outlet />
        </section>
        <section class="right-side-container">
            <ACard class="top-card mb">
                <div class="introduce mb">
                    <AAvatar
                        class="cp"
                        shape="square"
                        :size="50"
                        :src="processOSSLogo(userInfo?.avatar, true) || null"
                    >
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </AAvatar>
                    <div class="main">
                        <p class="name">{{ userInfo?.nickname || '昵称' }}</p>
                        <p class="description ellipsis">{{ userInfo?.info || '介绍' }}</p>
                    </div>
                </div>
                <div class="navs">
                    <section
                        v-for="({ icon, pathName, name }, index) in navList"
                        :class="{ 'nav-item': true, active: routeName === pathName }"
                        :key="index"
                        @click="handleGoPath(pathName)"
                    >
                        <ASpace class="text" size="middle">
                            <span><component :is="icon" /></span>
                            <span>{{ name }}</span>
                        </ASpace>
                    </section>
                </div>
            </ACard>
            <ACard class="bottom-card">
                <main class="main">
                    <section class="item">
                        <div class="amount mb">{{ userInfo?.count_project || 0 }}</div>
                        <div class="name">在读</div>
                    </section>
                    <section class="item">
                        <div class="amount mb">{{ userInfo?.count_comment || 0 }}</div>
                        <div class="name">注解</div>
                    </section>
                    <section class="item">
                        <div class="amount mb">{{ userInfo?.count_point || 0 }}</div>
                        <div class="name">积分</div>
                    </section>
                </main>
            </ACard>
        </section>
    </div>
</template>

<style scoped lang="less">
.user-home-layout {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-self: flex-start;

    .children-routes-container {
        flex: 4;
        padding-right: 20px;
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
        }

        .bottom-card {
            .main {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .item {
                    text-align: center;

                    .amount {
                        font-size: 24px;
                        font-weight: bold;
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
