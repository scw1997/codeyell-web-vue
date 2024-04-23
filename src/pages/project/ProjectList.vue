<script setup lang="ts">
import { Title, ProjectItem, Pagination } from '@/components';
import { Radio, RadioGroup, RadioButton, Empty } from 'ant-design-vue';
import { useLocation, useNav } from 'swico';
import { onMounted, ref, toRefs, watch, watchEffect } from 'vue';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import api from '@/api';
import { history } from 'swico';

interface StatesType {
    projectDataList: any[]; //当前页码搜索的数据列表
    searchParams: Record<string, any>; //搜索参数
}

const route = useLocation();
const nav = useNav();
const { query } = route;
const globalStore = useGlobalStore();
const { getLanguageData } = globalStore;
const { languageData } = storeToRefs(globalStore);
const states = ref<StatesType>({
    projectDataList: [],
    searchParams: {}
});

onMounted(() => {
    const func = async () => {
        if (languageData.value.length === 0) {
            await getLanguageData();
        }
    };
    func();
});

watch(
    [() => route.query],
    ([newQuery]) => {
        const { language_id, order_by, offset } = newQuery;
        states.value.searchParams = {
            language_id: language_id ? Number(language_id) : 0,
            order_by: order_by ?? 'comment',
            offset: offset ? Number(offset) : 0
        };
    },
    { immediate: true }
);

//跳转到项目详情
const handleJumpToProjectList = (id: number | string) => {
    nav({
        name: 'project-list',
        query: { language_id: id, order_by: states.value.searchParams.order_by }
    });
};
const setOrderBy = (order: string) => {
    // router.push(`/project?language_id=${language_id}&order_by=${order}`);

    nav({
        name: 'project-list',
        query: { language_id: states.value.searchParams.language_id, order_by: order }
    });
};
</script>

<template>
    <div class="search-page-root">
        <Title value="项目 - 源码阅读交流平台" />
        <section class="left-side-container">
            <ACard class="top-card mb">
                <div class="search-text pb">
                    <ASpace>
                        <span>排序</span>
                        <RadioGroup
                            :value="states.searchParams?.order_by"
                            @change="(e) => setOrderBy(e.target.value)"
                        >
                            <RadioButton value="comment">按注解数</RadioButton>
                            <RadioButton value="time">按创建时间</RadioButton>
                        </RadioGroup>
                    </ASpace>
                </div>

                <template v-if="states.projectDataList?.length > 0">
                    <ProjectItem
                        v-for="(item, index) in states.projectDataList"
                        class="project-item"
                        :data="item"
                        :key="index"
                        type="search"
                    />
                </template>

                <Empty v-else description="暂时没有项目" :image="Empty.PRESENTED_IMAGE_SIMPLE" />

                <Pagination
                    class="mt"
                    @change="
                        (data) => {
                            states.projectDataList = data;
                        }
                    "
                    :params="states.searchParams"
                    :url="api.project.geProList"
                />
            </ACard>
        </section>
        <section class="right-side-container">
            <ACard class="card">
                <div class="pb title">按语言筛选</div>
                <main class="pt">
                    <section class="language-item pb cp" @click="handleJumpToProjectList(0)">
                        <div :class="states.searchParams?.language_id == 0 ? 'current' : ''">
                            <span class="name">全部语言</span>
                        </div>
                    </section>

                    <template v-if="languageData?.length > 0">
                        <section
                            v-for="{ value, label } in languageData"
                            class="language-item pb cp"
                            :key="value"
                            @click="handleJumpToProjectList(value)"
                        >
                            <div
                                :class="value == states.searchParams?.language_id ? 'current' : ''"
                            >
                                <span class="name">{{ label }}</span>
                            </div>
                        </section>
                    </template>

                    <Empty v-else description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                </main>
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

            .language-item {
                display: flex;
                align-items: center;
            }
            .language-item .current {
                font-weight: bold;
            }

            .footer {
                text-align: center;
            }
        }
    }
}
</style>
