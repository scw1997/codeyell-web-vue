<script setup lang="ts">
import { useLocation } from 'swico';
import { Title, ProjectItem, Pagination, Logo } from '@/components';
import { Empty } from 'ant-design-vue';
import { onMounted, ref, toRefs, watch } from 'vue';
import { GithubOutlined } from '@ant-design/icons-vue';
import http from '@/utils/http';
import api from '@/api';
import useGlobalStore from '@/store/global';
import { processOSSLogo } from '@/utils/tools';
import { history } from 'swico';

const globalStore = useGlobalStore();
const route = useLocation();
const { getLanguageData } = globalStore;

interface StatesType {
    curSearchDataList: any[]; //当前页码搜索的数据列表
    recentData: any[]; //最新项目数据
    searchParams?: Record<string, any>; //搜索参数
}
const { userInfo, languageData } = toRefs(globalStore);
const states = ref<StatesType>({
    curSearchDataList: [],
    recentData: []
});

//跳转到项目详情
const handleJumpToProjectDetail = (id: number | string) => {
    history.push({ name: 'project-detail', query: { id } });
};
//获取最近项目列表
const getRecentData = async () => {
    const data = await http.post(api.project.getRecentProList);
    states.value.recentData = data;
    return data;
};
onMounted(() => {
    const func = async () => {
        await getRecentData();
        if (languageData.value.length === 0) {
            await getLanguageData();
        }
    };
    func();
});
//跳转到git仓库地址
const jumpToGitPath = (url: string, e: MouseEvent) => {
    e.stopPropagation();
    if (url) {
        window.open(url);
    }
};

watch(
    () => route.query,
    (newQuery) => {
        //参数变化，重置搜索数据
        states.value.searchParams = {
            keyword: newQuery['keyword']
        };
    },
    { immediate: true }
);

//根据languageId获取对应文本值
const getLanguageName = (languageId) =>
    languageData.value?.find((item) => item.value === languageId)?.label;
</script>
<template>
    <div class="search-page-root">
        <Title
            :value="`搜索项目${
                states.searchParams?.keyword ? `-${states.searchParams.keyword}` : ''
            } - 源码阅读交流平台`"
        />
        <section class="left-side-container">
            <ACard class="top-card mb">
                <div class="search-text pb">关键字：{{ states.searchParams?.keyword }}</div>
                <template v-if="states.curSearchDataList.length > 0">
                    <ProjectItem
                        v-for="(item, index) in states.curSearchDataList"
                        class="project-item"
                        :data="item"
                        :key="index"
                        type="search"
                    />
                </template>

                <Empty
                    v-else
                    description="没有搜索到相关项目"
                    :image="Empty.PRESENTED_IMAGE_SIMPLE"
                />

                <Pagination
                    class="mt"
                    @change="
                        (data) => {
                            states.curSearchDataList = data;
                        }
                    "
                    :params="states.searchParams"
                    :url="api.project.searchPro"
                />
            </ACard>
        </section>
        <section class="right-side-container">
            <ACard class="card">
                <div class="pb title">新增项目</div>
                <main class="pt">
                    <template v-if="states.recentData.length > 0">
                        <section
                            v-for="(
                                { name, language, count_star, id, logo, input_url }, index
                            ) in states.recentData"
                            class="project-item pb cp"
                            :key="index"
                            @click="handleJumpToProjectDetail(id)"
                        >
                            <AAvatar
                                @click="handleJumpToProjectDetail(id)"
                                shape="square"
                                :size="45"
                                :src="processOSSLogo(logo, false) || null"
                            >
                                <template #icon>
                                    <Logo />
                                </template>
                            </AAvatar>
                            <div class="main">
                                <ASpace direction="vertical">
                                    <span class="name">{{ name }}</span>
                                    <ASpace size="small">
                                        <ATooltip :title="getLanguageName(language)">
                                            <section class="language ellipsis">
                                                {{ getLanguageName(language) }}
                                            </section>
                                        </ATooltip>
                                        <section @click="jumpToGitPath(input_url, $event)">
                                            <GithubOutlined style="padding-right: 4px" />
                                            <ATag color="default">{{ count_star || 0 }}</ATag>
                                        </section>
                                    </ASpace>
                                </ASpace>
                            </div>
                        </section>
                    </template>
                    <Empty v-else description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                </main>
                <footer class="footer">
                    <AButton
                        @click="
                            () => {
                                history.push({ name: 'project-create' });
                            }
                        "
                        style="width: 100%"
                        type="primary"
                    >
                        新建项目
                    </AButton>
                </footer>
            </ACard>
        </section>
    </div>
</template>

<style scoped lang="less">
.search-page-root {
    align-self: flex-start;
    width: 100%;
    display: flex;

    .left-side-container {
        flex: 7;
        padding-right: 20px;

        .top-card {
            .search-text {
                font-size: 16px;
                // font-weight: bold;
                color: #525252;
            }

            .project-item {
                padding-bottom: 24px;
            }
        }
    }

    .right-side-container {
        flex: 2;

        .card {
            .title {
                font-size: 16px;
                border-bottom: 1px solid #dedede;
            }

            .project-item {
                display: flex;
                align-items: center;

                .main {
                    padding-left: 12px;
                    width: 0;
                    flex: 1;

                    :deep(.ant-space) {
                        display: flex;

                        .language {
                            min-width: 50px;
                            max-width: 60px;
                        }
                    }

                    .name {
                        font-weight: bold;
                    }
                }
            }

            .footer {
                text-align: center;
            }
        }
    }
}
</style>
