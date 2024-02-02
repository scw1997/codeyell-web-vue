<script setup lang="ts">
import JoinReading from './JoinReading.vue';
import Login from '@/views/auth/AuthLogin.vue';
import RetrievePwd from '@/views/auth//AuthRetrieve.vue';
import Sign from '@/views/auth/AuthSign.vue';
import useGlobalStore from '@/store/global';
import useReadStore from '@/store/read';
import { storeToRefs } from 'pinia';

const globalStore = useGlobalStore();
const readStore = useReadStore();
const { getJoinOrNot, setRightShowMode } = readStore;
const { rightShowMode, activeTab, curDetailData } = storeToRefs(readStore);
const slots = defineSlots<{ default(): any }>();

const changeVisiblePage = (mode: typeof rightShowMode.value) => {
    setRightShowMode(mode);
};
//登录成功
const handleLoginSuccess = async () => {
    //已登录

    const isJoined = await getJoinOrNot(curDetailData.value?.id);

    //未加入并且当前查看的是第二级及其往下的文件，则展示加入阅读的页面，否则可以查看注解（展示children）
    const joinPageVisible = !isJoined && Number(activeTab.value?.name.split('/').length) >= 2;

    setRightShowMode(joinPageVisible ? 'join' : 'note');
};
</script>

<template>
    <slot v-if="rightShowMode === 'note'"></slot>
    <div class="login-main" v-else-if="rightShowMode === 'login'">
        <h3>你尚未登录</h3>
        <p>登录后才拥有更多权限</p>
        <Login
            isControl
            @success="handleLoginSuccess"
            @retrieveClick="changeVisiblePage('retrieve')"
            @signClick="changeVisiblePage('sign')"
        />
    </div>
    <div class="login-main" v-else-if="rightShowMode === 'sign'">
        <h3>注册账号</h3>
        <Sign
            isControl
            @success="changeVisiblePage('login')"
            @loginClick="changeVisiblePage('login')"
            @retrieveClick="changeVisiblePage('retrieve')"
        />
    </div>
    <div class="login-main" v-else-if="rightShowMode === 'retrieve'">
        <h3>找回密码</h3>
        <RetrievePwd
            isControl
            @success="changeVisiblePage('login')"
            @loginClick="changeVisiblePage('login')"
            @signClick="changeVisiblePage('sign')"
        />
    </div>
    <JoinReading @success="handleLoginSuccess" v-else-if="rightShowMode === 'join'" />
</template>

<style scoped lang="less">
.login-main {
    text-align: center;
    width: 100%;
    max-width: 600px;
}
</style>
