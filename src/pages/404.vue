<script setup lang="ts">
import { Result } from 'ant-design-vue';
const { history } = Swico;

const type = 'primary';
</script>
<template>
    <Result status="404" subTitle="抱歉，你访问的页面不存在" title="404">
        <template #extra>
            <AButton
                @click="
                    () => {
                        history.replace('/');
                    }
                "
            >
                回到首页
            </AButton>
        </template>
    </Result>
</template>

<style scoped lang="less"></style>
