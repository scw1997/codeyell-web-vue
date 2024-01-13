<script setup lang="ts">
import { Title, NoteItem } from '@/components';
import { processOSSLogo } from '@/utils/tools';
import { GithubOutlined, ReadOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons-vue';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import { SelectProps, Empty } from 'ant-design-vue';
import { computed, onMounted, reactive, toRefs, VNode, watch, watchEffect } from 'vue';
import Logo from '@/components/Logo.vue';
import { useRouter } from 'vue-router';
import http from '@/utils/http';
import api from '@/api';

const globalStore = useGlobalStore();
const router = useRouter();
const { getLanguageData } = globalStore;
const { userInfo, languageData } = storeToRefs(globalStore);

const rangeOptions = [
    {
        label: '7天内',
        value: 1
    },
    {
        label: '1个月内',
        value: 2
    },
    {
        label: '1年内',
        value: 3
    }
];

interface StatesType {
    rangeValue: number; //热门项目的筛选日期
    languageValue: number; //热门项目的筛选语言
    recentProData: any[]; //最新项目数据
    offset: number; //热门评论列表查询的offset分页参数
    hotNoteData: StatesType['recentProData']; //热门评论数据
    isFinish: boolean; //热们评论数据是否加载完毕
    loading: boolean; //热门评论数据加载按钮状态
    hotProData: StatesType['recentProData']; //热门项目数据
    myProData: StatesType['recentProData']; //右侧用户项目数据
}

const states: StatesType = reactive({
    isFinish: true,
    loading: false,
    rangeValue: 1,
    languageValue: -1, //-1表示全部，不选
    recentProData: [],
    offset: 0,
    hotNoteData: [],
    hotProData: [],
    myProData: []
});

const {
    isFinish,
    loading,
    rangeValue,
    languageValue,
    recentProData,
    offset,
    hotNoteData,
    hotProData,
    myProData
} = toRefs(states);

//当前场景添加‘全部’选项
const formatLanguageData = computed<SelectProps['options']>(() => {
    return [{ label: '全部', value: -1 }, ...languageData.value];
});

//跳转到项目详情
const handleJumpToProjectDetail = (id: number | string) => {
    router.push(`/project/detail?id=${id}`);
};

//热门项目的下拉选项变化
const handleSelectChange = (type: 'range' | 'language', value: number) => {
    //
    const changeStateKey = type === 'range' ? 'rangeValue' : 'languageValue';
    states[changeStateKey] = value;
};

//获取最近项目列表
const getRecentProjectData = async () => {
    const data = await http.post(api.project.getRecentProList);
    states.recentProData = data;
    return data;
};
//获取热门项目列表
const getHotProjectData = async () => {
    const data = await http.post(api.project.getHotProList, {
        index: rangeValue.value,
        language: languageValue.value === -1 ? undefined : languageValue.value
    });
    states.hotProData = data;

    return data;
};

//获我的项目列表
const getMyProjectData = async () => {
    const { list = [] } = await http.post(api.user.getMyProList, { limit: 5 });

    states.myProData = list || [];
    return list;
};

//获取热门评论列表
const getHotNoteData = async (nextPage = false) => {
    //nextPage表示加载下一页数据
    const newOffset = nextPage ? offset.value + 10 : 0;
    if (nextPage) {
        states.loading = true;
    }
    const newData =
        (await http.post(api.comment.getRecentHotCommentList, { offset: newOffset })) || [];

    states.hotNoteData = nextPage ? [...hotNoteData.value, ...newData] : newData;
    states.offset = newOffset;
    states.isFinish = newData.length < 10;
    states.loading = nextPage ? false : loading.value;

    return newData;
};

//跳转到git仓库地址
const jumpToGitPath = (url: string, e: MouseEvent) => {
    e.stopPropagation();
    if (url) {
        window.open(url);
    }
};

const getLanguageName = (languageValue) => {
    return languageData.value?.find((item) => item.value === languageValue)?.label;
};

onMounted(() => {
    const func = async () => {
        await Promise.allSettled([getHotNoteData(), getRecentProjectData()]);

        if (languageData.value.length === 0) {
            await getLanguageData();
        }
    };

    func();
});

watchEffect(() => {
    if (userInfo.value) {
        getMyProjectData();
    }
});

watch(
    [rangeValue, languageValue],
    () => {
        getHotProjectData();
    },
    { immediate: true }
);
</script>

<template>
    <div class="index-page-layout">
        <Title value="CodeYell - 源码阅读交流平台" />
        <section class="left-side-container">
            <ACard class="top-card mb">
                <section>
                    <ASpace size="large">
                        <span class="title">热门项目</span>
                        <ASelect
                            @change="(value) => handleSelectChange('range', value)"
                            :options="rangeOptions"
                            style="width: 120px"
                            :value="rangeValue"
                        />
                        <ASelect
                            @change="(value) => handleSelectChange('language', value)"
                            :options="formatLanguageData"
                            style="width: 120px"
                            :value="languageValue"
                        />
                    </ASpace>
                </section>

                <ARow
                    align="middle"
                    class="project-list"
                    :justify="hotProData.length !== 0 ? 'space-between' : 'center'"
                >
                    <template v-if="hotProData.length > 0">
                        <ACol
                            v-for="(
                                { name, logo, member_recent, code_comment_recent, id, info }, index
                            ) in hotProData"
                            class="project-item pt pr cp"
                            :key="index"
                            @click="handleJumpToProjectDetail(id)"
                            span="12"
                        >
                            <AAvatar
                                class="avatar"
                                shape="square"
                                :size="56"
                                :src="processOSSLogo(logo, false) || null"
                            >
                                <template #icon><Logo /></template>
                            </AAvatar>
                            <main class="main pl">
                                <div class="top">
                                    <div class="name ellipsis">{{ name }}</div>
                                    <div class="data">
                                        <span class="pr" title="新增阅读人数">
                                            <UserAddOutlined />
                                            <span class="amount">
                                                {{ member_recent || 0 }}
                                            </span>
                                        </span>
                                        <span title="新增注解">
                                            <ReadOutlined />
                                            <span class="amount">
                                                {{ code_comment_recent || 0 }}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div class="bottom ellipsis-2">
                                    <APopover>
                                        <template #content>
                                            <div style="max-width: 400px">
                                                {{ info }}
                                            </div>
                                        </template>
                                        {{ info }}
                                    </APopover>
                                </div>
                            </main>
                        </ACol>
                    </template>

                    <AEmpty v-else description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                </ARow>
            </ACard>

            <ACard class="bottom-card">
                <div class="title">近期热门注解</div>
                <NoteItem
                    v-for="(item, index) in hotNoteData"
                    class="pb"
                    :data="item"
                    :key="index"
                    type="index"
                />

                <ARow justify="center">
                    <ACol flex="none">
                        <template v-if="hotNoteData.length > 0">
                            <span v-if="isFinish" class="finish-text">已加载全部数据</span>
                            <AButton v-else :loading="loading" @click="getHotNoteData(true)">
                                加载更多
                            </AButton>
                        </template>
                        <AEmpty
                            v-else
                            description="暂无数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </ACol>
                </ARow>
            </ACard>
        </section>

        <section class="right-side-container">
            <!--    登录后显示-->

            <template v-if="!!userInfo">
                <ACard class="top-card mb">
                    <div class="introduce pb mb">
                        <AAvatar
                            class="cp"
                            @click="
                                () => {
                                    router.push('/my/personal_page');
                                }
                            "
                            shape="square"
                            :size="50"
                            :src="processOSSLogo(userInfo?.avatar, true) || null"
                        >
                            <template #icon>
                                <UserOutlined />
                            </template>
                        </AAvatar>
                        <div class="main">
                            <p class="name ellipsis">{{ userInfo?.nickname || '昵称' }}</p>
                            <p class="description ellipsis">介绍</p>
                        </div>
                    </div>

                    <div class="project-list">
                        <template v-if="myProData.length > 0">
                            <span
                                v-for="(
                                    { name, count_comment, count_member, logo, id, status }, index
                                ) in myProData"
                                class="project-item cp"
                                :key="index"
                                @click="handleJumpToProjectDetail(id)"
                            >
                                <AAvatar
                                    :class="{ 'avatar-creating': status === 0 }"
                                    shape="square"
                                    :size="45"
                                    :src="processOSSLogo(logo, false) || null"
                                >
                                    <template #icon><Logo /></template>
                                </AAvatar>
                                <div class="main">
                                    <ASpace direction="vertical">
                                        <span class="name">{{ name }}</span>
                                        <ASpace size="middle">
                                            <span title="在读人数">
                                                <UserOutlined />
                                                <span class="amount">
                                                    {{ count_member || 0 }}
                                                </span>
                                            </span>
                                            <span title="注解数">
                                                <ReadOutlined />
                                                <span class="amount">
                                                    {{ count_comment || 0 }}
                                                </span>
                                            </span>
                                        </ASpace>
                                    </ASpace>
                                </div>
                            </span>
                        </template>
                        <Empty
                            v-else
                            description="暂无项目数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </div>
                </ACard>
            </template>

            <ACard class="bottom-card">
                <div class="pb title">新增项目</div>
                <main class="pt">
                    <template v-if="recentProData.length > 0">
                        <section
                            v-for="(
                                { name, language, count_star, id, logo, input_url }, index
                            ) in recentProData"
                            class="project-item pb cp"
                            :key="index"
                            @click="handleJumpToProjectDetail(id)"
                        >
                            <AAvatar
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
                                    <ASpace size="middle">
                                        <section class="language">
                                            {{ getLanguageName(language) }}
                                        </section>
                                        <section @click="jumpToGitPath(input_url)">
                                            <GithubOutlined style="padding-right: 4px" />
                                            <ATag color="default">{{ count_star || 0 }}</ATag>
                                        </section>
                                    </ASpace>
                                </ASpace>
                            </div>
                        </section>
                    </template>
                    <Empty
                        v-else
                        description="暂无项目数据"
                        :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    />
                </main>
                <footer class="footer">
                    <AButton
                        @click="
                            () => {
                                router.push('/project/create');
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
.index-page-layout {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-self: flex-start;

    .avatar-creating {
        &::after {
            content: '创建中';
            position: absolute;
            width: 100%;
            height: 100%;
            font-size: 12px;
            top: 0;
            left: 0;
            background-color: #32343873;
        }
    }

    .left-side-container {
        flex: 7;
        padding-right: 20px;

        .top-card {
            .title {
                font-weight: bold;
            }

            .project-list {
                .project-item {
                    display: flex;
                    //align-items: center;
                    .avatar {
                        flex: none;
                    }

                    .main {
                        flex: 1;
                        width: 0;

                        .top {
                            display: flex;
                            justify-content: space-between;

                            .name {
                                //flex: none;
                                font-weight: bold;
                            }

                            .data {
                                color: #868a8e;
                                flex: none;

                                .amount {
                                    padding-left: 4px;
                                    font-size: 12px;
                                    vertical-align: text-bottom;
                                }
                            }
                        }

                        .bottom {
                            font-size: 12px;
                        }
                    }
                }
            }
        }

        .bottom-card {
            .title {
                font-weight: bold;
                padding-bottom: 20px;
            }

            .finish-text {
                color: #868a8e;
            }
        }
    }

    .right-side-container {
        flex: 2;
        width: 0;

        .top-card {
            .introduce {
                display: flex;
                align-items: center;
                border-bottom: 1px solid #ccc;

                .main {
                    padding-left: 14px;
                    width: 0;
                    flex: 1;

                    p {
                        margin: 0;
                    }

                    .name {
                        font-size: 18px;
                    }
                }
            }

            .project-list {
                .project-item {
                    cursor: pointer;

                    display: flex;
                    align-items: center;

                    &:not(:last-child) {
                        padding-bottom: 12px;
                    }

                    .main {
                        padding-left: 12px;
                        width: 0;
                        flex: 1;

                        .ant-space {
                            display: flex;

                            .ant-space-item {
                                text-overflow: ellipsis;
                                overflow: hidden;
                                white-space: nowrap;
                            }
                        }

                        .name {
                            font-weight: bold;
                        }

                        .amount {
                            padding-left: 4px;
                        }
                    }
                }
            }
        }

        .bottom-card {
            .title {
                font-size: 16px;
                border-bottom: 1px solid #868a8e;
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

                        .ant-space-item {
                            text-overflow: ellipsis;
                            overflow: hidden;
                            white-space: nowrap;
                        }

                        .language {
                            min-width: 50px;
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
