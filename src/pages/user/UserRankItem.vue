<script setup lang="ts">
import { toRefs } from 'vue';
import { Avatar } from 'ant-design-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { processOSSLogo } from '@/utils/tools';
import { history, useNav } from 'swico';

interface RankItemProps {
    data: Record<string, any> | null;
    mode?: 'like' | 'comment';
}

const props = withDefaults(defineProps<RankItemProps>(), { data: null, mode: 'comment' });
const nav = useNav();
const jumpToUserPublicPage = (userid: number) => {
    nav({ name: 'user-public', query: { id: userid } });
};
</script>

<template>
    <div :class="{ 'rank-item': true, like: mode === 'like' }">
        <span class="number">{{ data?.Rank }}</span>
        <div class="main cp" @click="jumpToUserPublicPage(data?.Id)">
            <Avatar shape="square" :size="42" :src="processOSSLogo(data?.Avatar, true) || null">
                <template #icon>
                    <UserOutlined />
                </template>
            </Avatar>
            <div class="text">
                <div class="name" v-if="data?.mode === 'like'">
                    <span class="main-name ellipsis">{Nickname || '昵称"</span>
                </div>

                <div v-else class="name ellipsis">{{ data?.Nickname || '昵称' }}</div>

                <div class="introduce ellipsis">{{ data?.Info || '介绍' }}</div>
            </div>
        </div>
        <section class="amount-text">
            <div class="amount">{{ data?.Count }}</div>
            <span class="text">{{ data?.mode === 'like' ? '被赞' : '注解' }}</span>
        </section>
    </div>
</template>

<style scoped lang="less">
.rank-item {
    display: flex;
    padding: 20px 10px;
    align-items: center;
    border-bottom: 1px solid rgba(241, 241, 241, 1);

    &.omit {
        justify-content: center;
        font-weight: bold;
    }

    &:last-child {
        border-bottom: none;
    }

    .number {
        color: #f7e551;
        font-weight: bold;
        font-size: 32px;
        padding-right: 20px;
    }

    &:nth-child(1) .number {
        color: #ff1212;
    }

    &:nth-child(2) .number {
        color: #ec5109;
    }

    .main {
        flex: 1;
        display: flex;
        align-items: center;

        .text {
            font-size: 16px;
            padding: 0 20px;
            flex: 1;
            width: 0;

            .name {
            }

            .introduce {
                font-size: 14px;
                color: #868a8e;
            }
        }
    }

    .amount-text {
        text-align: center;

        .amount {
            font-size: 24px;
            font-weight: bold;
        }

        .text {
            font-size: 16px;
            color: #868a8e;
        }
    }

    &.like .main .text .name .join {
        font-size: 14px;
        padding-left: 14px;
        color: #868a8e;
    }

    &.like .main .text {
        .name {
            display: flex;

            .join {
                flex: none;
                line-height: 1.8;
            }
        }
    }
}
</style>
