<script setup lang="ts">
import { useLocation } from 'secywo-template-cli';
import { CommentItem, CommentModal, NoteItem, Pagination, Title, Logo } from '@/components';
import Toast from '@/utils/Toast';
import { CaretRightOutlined, GithubOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import api from '@/api';
import useGlobalStore from '@/store/global';
import http from '@/utils/http';
import { authFunc, EMPTY, processOSSLogo } from '@/utils/tools';
import { storeToRefs } from 'pinia';
import {
    App,
    QRCode,
    RadioGroup,
    Empty,
    RadioButton,
    TypographyLink,
    TypographyText
} from 'ant-design-vue';
import { defineComponent, h, onMounted, ref, watch } from 'vue';

const { history } = Secywo;
const globalStore = useGlobalStore();
const { userInfo } = storeToRefs(globalStore);
const route = useLocation();
interface StatesType {
    commentList: any[]; //当前项目评论数据
    orderType: 'time' | 'liked'; //评论排序方式，time最近/liked最热
    commentParams: Record<string, any>; //获取评论列表数据的参数
    isCommentReady: boolean; //是否可以获取评论数据
}
const { modal } = App.useApp();
const { id: projectId, invite_id: inviteId } = route.query;

const states = ref<StatesType>({
    commentList: [],
    orderType: 'time',
    commentParams: {},
    isCommentReady: false
});

const detailStates = ref<Record<string, any>>(null); //当前项目详情信息

//未携带项目id参数
if (!projectId) {
    history.replace('/404');
}

//点击分享按钮
const handleShareClick = () => {
    const shareUrl = `${window.location.href}${
        userInfo.value?.id ? `&invite_id=${userInfo.value.id}` : ''
    }`;

    const content = /*#__PURE__*/ defineComponent({
        components: {
            TypographyLink,
            QRCode,
            TypographyText
        },
        props: {
            shareUrl: {
                default: shareUrl
            }
        },
        template: `
      <div>
        <section>
          <TypographyLink copyable>{{ shareUrl }}</TypographyLink>
        </section>
        <section>
          <h3>分享二维码</h3>
          <QRCode :value="shareUrl"/>
        </section>

        <TypographyText v-if="!!userInfo" type="warning">
          登录后分享好友注册可得积分
        </TypographyText>

      </div>`
    });
    modal.info({
        title: '分享链接',

        width: 600,
        maskClosable: true,
        footer: null,
        content: h(content)
    });
};
//跳转当前项目的阅读页
const handleJumpToRead = (id: number) => {
    window.open(`/project/read?id=${id}`);
};

//获取当前项目信息
const getProjectDetailData = async () => {
    const data = await http.post(api.project.getProDetail, {
        project_id: projectId
    });
    detailStates.value = data;
    return data;
};

//获取初始数据
const getInitData = () => {
    if (projectId) {
        getProjectDetailData().then((detailData) => {
            const { status } = detailData;
            if (status === 2) {
                //项目创建状态为成功则获取项目评论列表
                states.value.isCommentReady = true;
            }
        });
    }
};

onMounted(() => {
    getInitData();
    if (inviteId) {
        globalStore.setInviteId(inviteId as string);
    }
});

//跳转到git仓库地址
const jumpToGitPath = (url: string) => {
    if (url) {
        window.open(url);
    }
};

watch(
    () => states.value.orderType,
    (newOrderType) => {
        states.value.commentParams = { project_id: projectId, order_by: newOrderType };
    },
    { immediate: true }
);
</script>
<template>
    <div class="project-detail-page-root">
        <Title
            :value="`项目详情${
                detailStates?.name ? `-${detailStates.name}` : ''
            } - 源码阅读交流平台`"
        />
        <section class="left-side-container">
            <ACard class="top-card mb">
                <ARow :gutter="15">
                    <ACol>
                        <AAvatar
                            shape="square"
                            :size="60"
                            :src="processOSSLogo(detailStates?.logo, false) || null"
                        >
                            <template #icon>
                                <Logo />
                            </template>
                        </AAvatar>
                    </ACol>

                    <ACol flex="1">
                        <ARow align="middle" :gutter="15" justify="space-between">
                            <ACol flex="1" style="width: 0">
                                <ASpace size="middle">
                                    <span class="project-name ellipsis">
                                        {{ detailStates?.name || '加载中' }}
                                    </span>
                                    <span>
                                        <ATag color="default">
                                            {{ detailStates?.language_str || '' }}
                                        </ATag>
                                    </span>

                                    <span v-if="!!detailStates?.tag" class="branch-name">
                                        Tag: {{ detailStates?.tag }}
                                    </span>

                                    <span v-if="!!detailStates?.branch" class="branch-name">
                                        Branch: {{ detailStates?.branch }}
                                    </span>
                                </ASpace>
                            </ACol>
                            <ACol class="project-msg" flex="none">
                                <ASpace size="middle">
                                    <span
                                        class="cp"
                                        @click="jumpToGitPath(detailStates?.input_url)"
                                    >
                                        <GithubOutlined />
                                        &nbsp;
                                        <ATag color="default">
                                            {{ detailStates?.count_star || 0 }}
                                        </ATag>
                                    </span>

                                    <span title="分享" v-if="detailStates?.status === 2">
                                        <ShareAltOutlined
                                            class="cp"
                                            @click="handleShareClick"
                                            style="font-size: 20px"
                                        />
                                    </span>
                                </ASpace>
                            </ACol>
                        </ARow>
                        <div class="description mt">{{ detailStates?.info || '介绍' }}</div>
                    </ACol>
                </ARow>
            </ACard>

            <ACard class="bottom-card">
                <ARow align="middle" v-if="detailStates?.status !== 2" justify="center">
                    <ACol flex="none">
                        <p class="fail-text" v-if="detailStates?.status === 3">
                            当前项目创建失败，系统管理员将会1个工作日内处理
                        </p>
                        <template v-if="detailStates?.status === 1">
                            <p class="fail-text">项目正在创建中，请稍后...</p>
                            <AButton @click="getInitData" type="link">点击刷新项目状态</AButton>
                        </template>

                        <span v-else>暂无当前项目信息</span>
                    </ACol>
                </ARow>

                <div v-else>
                    <ARow align="middle" class="pb" justify="space-between">
                        <ACol>
                            <RadioGroup
                                buttonStyle="solid"
                                class="radio-btns"
                                @change="
                                    (e) => {
                                        states.orderType = e.target.value;
                                    }
                                "
                                :value="states.orderType"
                            >
                                <RadioButton value="time">最新注解</RadioButton>
                                <RadioButton value="liked">热门注解</RadioButton>
                            </RadioGroup>
                        </ACol>
                        <ACol>
                            <AButton
                                :disabled="detailStates?.status !== 2"
                                @click="handleJumpToRead(detailStates?.id)"
                                type="primary"
                            >
                                在线阅读源码
                            </AButton>
                        </ACol>
                    </ARow>
                    <template v-if="states.commentList?.length > 0">
                        <div
                            class="pb"
                            :key="index"
                            v-for="(commentItem, index) in states.commentList"
                        >
                            <NoteItem class="pb" :data="commentItem" :key="index" type="detail" />
                            <div class="comment-list" v-if="commentItem?.children?.length > 0">
                                <CommentItem
                                    v-for="(childrenItem, index) in commentItem?.children"
                                    :class="`${
                                        index !== commentItem?.children?.length - 1 && 'pb'
                                    } comment-item`"
                                    :data="childrenItem"
                                    :key="index"
                                    type="detail"
                                />
                            </div>
                        </div>
                    </template>
                    <Empty v-else description="暂无评论" :image="Empty.PRESENTED_IMAGE_SIMPLE" />

                    <Pagination
                        class="mt"
                        :isReady="states.isCommentReady"
                        @change="
                            (data) => {
                                states.commentList = data;
                            }
                        "
                        :params="states.commentParams"
                        :url="api.comment.getCommentListByCode"
                    />
                </div>
            </ACard>
        </section>
        <section class="right-side-container">
            <ACard class="top-card mb">
                <ARow align="middle" class="main" justify="space-between">
                    <ACol class="item">
                        <div class="amount">{{ detailStates?.count_member || 0 }}</div>
                        <span class="text">人在读</span>
                    </ACol>
                    <ACol class="item">
                        <div class="amount">{{ detailStates?.count_comment || 0 }}</div>
                        <span class="text">注解</span>
                    </ACol>
                    <ACol class="item">
                        <div class="amount">{{ detailStates?.count_line || 0 }}</div>
                        <span class="text">代码行</span>
                    </ACol>
                </ARow>
            </ACard>

            <ACard class="top-card" title="阅读源码">
                <ARow align="middle">
                    <ACol :span="24">
                        <p style="font-weight: 600">方式1 在浏览器中阅读</p>
                        <AButton
                            :disabled="detailStates?.status !== 2"
                            @click="handleJumpToRead(detailStates?.id)"
                            style="width: 100%"
                            type="primary"
                        >
                            在线阅读源码
                        </AButton>
                        <p class="pt" style="font-weight: 600">方式2 使用VS Code阅读</p>
                        <div style="font-size: 14px">
                            <p>
                                1. 安装插件: 在VS Code中按Ctrl+p, 输入 ext install LiFang.codeyell
                                安装, 或者在VS Code中搜索扩展 "codeyell"
                            </p>
                            <p>
                                2. Clone代码到本地:

                                <TypographyLink copyable v-if="!!detailStates?.local_clone_url">
                                    {{ detailStates.local_clone_url }}
                                </TypographyLink>
                            </p>
                            <p>3. VS Code中打开上面的源码目录</p>
                            <p>
                                4.
                                浏览源码文件即可查看某行代码的注解或者鼠标右键点击某行代码发表注解
                            </p>
                        </div>
                    </ACol>
                </ARow>
                <ARow align="middle" class="pt" justify="center">
                    <ACol :span="24"></ACol>
                </ARow>
            </ACard>
        </section>
    </div>
</template>

<style scoped lang="less">
.project-detail-page-root {
    align-self: flex-start;
    width: 100%;
    display: flex;

    .left-side-container {
        flex: 7;
        padding-right: 20px;

        .top-card {
            .project-name {
                font-weight: bold;
            }
            .branch-name {
                color: #868a8e;
            }
        }

        .bottom-card {
            .radio-btns {
                .ant-radio-button-wrapper {
                    z-index: 0;
                }
            }

            .comment-list {
                margin-left: 50px;
                background-color: #f8f8f8;
                padding: 20px;
                border-radius: 10px;
            }

            .fail-text {
                text-align: center;
            }
        }
    }

    .right-side-container {
        flex: 2;

        .top-card {
            .main {
                //padding-bottom: 20px;
                //border-bottom: 1px solid #868a8e;

                .item {
                    text-align: center;

                    .amount {
                        font-size: 24px;
                        font-weight: bold;
                    }
                }
            }
        }

        .bottom-card {
            .ant-card-body {
                padding: 18px;
            }

            .title {
                font-weight: bold;
                padding-bottom: 10px;
            }

            .tag-list {
                .tag-item {
                    margin-bottom: 8px;
                }
            }

            .footer {
                text-align: center;
            }
        }
    }
}
</style>
