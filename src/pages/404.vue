<script setup lang="ts">
import { history, useNav } from 'swico';
import { Result } from 'ant-design-vue';
const nav = useNav();
const type = 'primary';
</script>
<template>
    <Result status="404" subTitle="抱歉，你访问的页面不存在" title="404">
        <template #extra>
            <AButton
                @click="
                    () => {
                        nav('/', { replace: true });
                    }
                "
            >
                回到首页
            </AButton>
        </template>
    </Result>
</template>

<style scoped lang="less"></style>
