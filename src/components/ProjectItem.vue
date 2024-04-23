<script setup lang="ts">
import { history, useNav } from 'swico';
import { GithubOutlined, UserOutlined, ReadOutlined, LikeOutlined } from '@ant-design/icons-vue';
import { dateFormat, processOSSLogo } from '@/utils/tools';
import Logo from '@/components/Logo.vue';
interface PropsType {
    type?: 'my' | 'search' | 'public'; //展示样式类型，我的用户资料页面样式/搜索页面样式/公开资料页面样式
    data: Record<string, any>;
}

const props = defineProps<PropsType>();
const nav = useNav();
//跳转到项目详情页
const jumpToProjectDetailPage = (projectId: number) => {
    nav({ name: 'project-detail', query: { id: projectId } });
};

//跳转到git仓库地址
const jumpToGitPath = (url: string) => {
    if (url) {
        window.open(url);
    }
};
</script>

<template>
    <div class="project-item-component-root">
        <ARow align="top" class="container" :gutter="[15, 15]" justify="space-between">
            <ACol class="avatar cp" flex="none" @click="jumpToProjectDetailPage(data.id)">
                <AAvatar
                    class="avatar"
                    shape="square"
                    :size="56"
                    :src="processOSSLogo(data.logo, false) || null"
                >
                    <template #icon><Logo /></template>
                </AAvatar>
            </ACol>
            <ACol class="text" flex="1">
                <section class="ellipsis cp" @click="jumpToProjectDetailPage(data.id)">
                    <ASpace size="middle">
                        <span class="title">{{ data.name || '项目名' }}</span>
                        <span>
                            <ATag color="default">{{ data.language_str || '' }}</ATag>
                        </span>

                        <span v-if="!!data.tag" class="branch-name pl">Tag: {{ data.tag }}</span>

                        <span v-if="!!data.branch" class="branch-name pl">
                            Branch: {{ data.branch }}
                        </span>
                    </ASpace>
                </section>
                <section class="desc ellipsis-2">
                    <APopover>
                        {{ data.info || '介绍' }}

                        <template #content>
                            <div style="max-width: 400pc">{{ data.info }}</div>
                        </template>
                    </APopover>
                </section>
            </ACol>
            <ACol class="right-side" flex="none">
                <section class="mb">
                    <ASpace size="large">
                        <span>
                            Clone on:
                            {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : null }}
                        </span>
                        <span class="cp" @click="jumpToGitPath(data.input_url)">
                            <GithubOutlined />
                            &nbsp;
                            <ATag class="git-tag" color="default">
                                {{ data.count_star || 0 }}
                            </ATag>
                        </span>
                    </ASpace>
                </section>
                <section :class="['statistics', type === 'search' ? 'search' : 'user']">
                    <ASpace v-if="['my', 'search'].includes(type)" size="large">
                        <span title="在读人数">
                            <UserOutlined />
                            <span class="amount">{{ data.count_member || 0 }}</span>
                        </span>
                        <span title="注解数">
                            <ReadOutlined />
                            <span class="amount">{{ data.count_comment || 0 }}</span>
                        </span>
                    </ASpace>

                    <ASpace v-else-if="type === 'public'" size="large">
                        <span title="发表注解">
                            <ReadOutlined />
                            <span class="amount">{{ data.count_comment || 0 }}</span>
                        </span>
                        <span title="被赞数">
                            <LikeOutlined />
                            <span class="amount">{{ data?.count_liked || 0 }}</span>
                        </span>
                    </ASpace>
                </section>
            </ACol>
        </ARow>
    </div>
</template>

<style scoped lang="less">
.project-item-component-root {
    .text {
        width: 0;

        .title {
            font-weight: bold;
            padding-bottom: 4px;
        }

        .desc {
            font-size: 12px;
        }

        .branch-name {
            color: #868a8e;
        }
    }

    .right-side {
        .statistics {
            text-align: right;

            &.search {
                color: #81838f;
            }

            .amount {
                padding-left: 4px;
            }
        }

        .git-tag {
            margin-inline-end: 0;
        }
    }
}
</style>
