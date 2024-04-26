<script setup lang="ts">
import api from '@/api';
import { CommentModal, Title, Logo } from '@/components';
import Toast from '@/utils/Toast';
import Left from './ProjectReadLeft.vue';
import Middle from './ProjectReadMiddle.vue';
import Right from './ProjectReadRight.vue';
import useGlobalStore from '@/store/global';
import http from '@/utils/http';
import {
    CaretRightOutlined,
    CloseCircleOutlined,
    LeftOutlined,
    PlusCircleOutlined,
    ShareAltOutlined,
    UserOutlined
} from '@ant-design/icons-vue';
import { App, QRCode, Tooltip, Space, TypographyLink, TypographyText } from 'ant-design-vue';
import { processOSSLogo } from '@/utils/tools';
import { CurNoteModalData, TabItem } from '@/store/read';
import useReadStore from '@/store/read';
import { storeToRefs } from 'pinia';
import { useLocation, history, useNav } from 'swico';
import { defineComponent, h, markRaw, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';

const route = useLocation();
const { id: projectId, invite_id: inviteId } = route.query;
const globalStore = useGlobalStore();
const readStore = useReadStore();
const {
    setCurNoteFileData,
    setTabList,
    clearStoreData,
    getJoinOrNot,
    setCurDetailData,
    getNoteLineDataByFile,
    setRightShowMode,
    setCurNoteModalData
} = readStore;
const {
    tabList,
    curNoteFileData,
    tabChangeType,
    activeTab,
    isJoined,
    isPush,
    curDetailData: detailData,

    curNoteModalData,
    noteListPageRef
} = storeToRefs(readStore);

const { token, userInfo } = storeToRefs(globalStore);

const { modal } = App.useApp();
const nav = useNav();
const noteModel = defineModel({ default: '' });

const modalTitle = shallowRef(null);

//阅读页点击返回
const goBack = () => {
    if (!isPush.value) {
        //不是从项目详情跳转过来的情况
        nav({ name: 'project-detail', query: { id: projectId } });
    } else {
        //返回到项目详情页
        nav(-1);
    }
};

//点击分享按钮
const handleShareClick = () => {
    const shareUrl = `${window.location.href}${
        userInfo.value?.id ? `&invite_id=${userInfo.value?.id}` : ''
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

//处理打开注解弹窗的操作
const handleOpenNoteModal = (
    type: CurNoteModalData['mode'],
    record?: CurNoteModalData['record']
) => {
    console.log('type', type);
    console.log('record', record);
    //中间区域右击发表注解/右边区域点击发表注解
    if (type && ['create', 'createInNotes'].includes(type)) {
        setCurNoteFileData({
            startLine: record!.start_line,
            endLine: record!.end_line,
            fileId: activeTab.value!.fileId,
            filePath: activeTab.value!.key,
            shortFilePath: activeTab.value!.shortName,
            createMode: type as 'create' | 'createInNotes'
        });
    }
    if (!token.value || !isJoined.value) {
        //未登录/未加入，则重置相关状态

        setCurNoteModalData({
            visible: false,
            mode: 'create',
            record: undefined,
            content: undefined
        });
        //切换登录/加入模式
        setRightShowMode(!token.value ? 'login' : 'join');
    } else {
        setRightShowMode('note');

        setCurNoteModalData({
            visible: true,
            mode: type,
            record: record,
            content: type === 'edit' ? record?.content : curNoteModalData.value.content
        });
        noteModel.value = type === 'edit' ? record?.content : curNoteModalData.value.content;
    }
};

//注解弹窗点击确定
const handleCommentModalOk = async () => {
    const { content, mode, record } = curNoteModalData.value || {};

    if (!content) {
        return Toast.info('注解内容不能为空');
    }
    let apiPath = '',
        params;
    //处理不同发表注解模式下的接口地址和参数
    switch (true) {
        case mode && ['create', 'createInNotes'].includes(mode):
            apiPath = api.code.createNote;
            params = {
                reply_to_id: undefined,
                root_id: undefined,
                content: content,
                project_id: projectId,
                file_id: activeTab.value?.fileId, //针对哪个文件的评论，数据来自web/v1/code/file_tree接口中的key字段
                file_path: activeTab.value?.name,
                start_line: record?.start_line, //评论针对代码行的起始行，子评论值为0
                end_line: record?.end_line //评论针对代码行的终止行，子评论值为0
            };
            break;
        case mode === 'edit':
            apiPath = api.code.editNote;
            params = {
                comment_id: record?.id,
                content: content,
                file_id: curNoteFileData.value?.fileId,
                start_line: curNoteFileData.value?.startLine,
                end_line: curNoteFileData.value?.endLine
            };
            break;

        case mode === 'reply':
            apiPath = api.code.createNote;
            params = {
                reply_to_id: record?.id,
                root_id: record?.id,
                content: content,
                project_id: projectId,
                file_id: curNoteFileData.value?.fileId, //针对哪个文件的评论，数据来自web/v1/code/file_tree接口中的key字段
                file_path: curNoteFileData.value?.filePath,
                start_line: curNoteFileData.value?.startLine, //评论针对代码行的起始行，子评论值为0
                end_line: curNoteFileData.value?.endLine //评论针对代码行的终止行，子评论值为0
            };
            break;
        case mode === 'childReply':
            apiPath = api.code.createNote;
            params = {
                reply_to_id: record?.id,
                root_id: record?.root_id,
                content: content,
                project_id: projectId,
                file_id: curNoteFileData.value?.fileId, //针对哪个文件的评论，数据来自web/v1/code/file_tree接口中的key字段
                file_path: curNoteFileData.value?.filePath,
                start_line: curNoteFileData.value?.startLine, //评论针对代码行的起始行，子评论值为0
                end_line: curNoteFileData.value?.endLine //评论针对代码行的终止行，子评论值为0
            };
            break;
    }
    //发表评论
    await http.post(apiPath, params);
    Toast.success('操作成功');
    //重置弹窗相关状态
    setCurNoteModalData({
        content: '',
        mode: 'create',
        visible: false,
        record: undefined
    });

    if (mode === 'create' || mode === 'createInNotes') {
        //更新当前文件的含注解代码行数据
        const noteLineData = await getNoteLineDataByFile(
            projectId! as string,
            activeTab.value!.name,
            activeTab.value!.fileId
        );
        const matchTabItemIndex = tabList.value.findIndex(
            (item) => item.key === activeTab.value!.name
        );
        const newTabList = tabList.value.slice();

        if (matchTabItemIndex !== -1) {
            //更新当前tab的noteLineData字段
            newTabList[matchTabItemIndex] = {
                ...newTabList[matchTabItemIndex],
                noteLineData
            };
            setTabList(newTabList);
        }
    }
    //刷新注解列表数据
    const { getData, pageNo } = noteListPageRef.value!;
    getData(pageNo);
};

//获取当前项目信息
const getProjectDetailData = async () => {
    const data = await http.post(api.project.getProDetail, {
        project_id: projectId
    });
    setCurDetailData(data);
};

watch(curNoteModalData, (newNoteModalData) => {
    const { mode, content, record } = newNoteModalData || {};
    let newModalTitle;
    switch (true) {
        case mode && ['create', 'createInNotes'].includes(mode):
            newModalTitle = defineComponent({
                components: {
                    Space,
                    CaretRightOutlined,
                    Tooltip
                },
                props: {
                    activeTab: {
                        default: activeTab.value
                    },
                    record: {
                        default: record
                    }
                },
                template: `  <Space>
                        <span>发表注解</span>
                        <CaretRightOutlined />
                        <span>
                            <Tooltip :title="activeTab?.name">
                                <span style="padding-right: 10px">{{activeTab?.shortName}}</span>
                            </Tooltip>
                            （起始行:
                            <span style= "color: #f3aa26;padding-right: 10px ">
                                {{record?.start_line}}
                            </span>
                            结束行:
                            <span style= "color: #f3aa26">{{record?.end_line}}</span>）
                        </span>
                    </Space>`
            });
            break;
        case mode === 'reply':
            newModalTitle = defineComponent({
                components: {
                    Space,
                    CaretRightOutlined
                },
                props: {
                    record: {
                        default: record
                    }
                },
                template: `  <Space>
                        <span>回复注解</span>
                        <CaretRightOutlined />
                        <span>{{record?.user_info?.nickname}}</span>
                    </Space>`
            });
            break;
        case mode === 'edit':
            newModalTitle = defineComponent({
                components: {
                    Space,
                    CaretRightOutlined
                },
                props: {
                    record: {
                        default: record
                    }
                },
                template: `  <Space>
                        <span>修改注解</span>
                        <CaretRightOutlined />
                        <span>{{record?.id}}</span>
                    </Space>`
            });
            break;
        case mode === 'childReply':
            newModalTitle = defineComponent({
                components: {
                    Space,
                    CaretRightOutlined
                },
                props: {
                    record: {
                        default: record
                    }
                },
                template: `  <Space>
                  <span>回复注解</span>
                  <CaretRightOutlined />
                  <span>{{record?.user_info?.nickname}}</span>
                </Space>`
            });
            break;
    }
    modalTitle.value = markRaw(newModalTitle);
});

const openMyPage = () => {
    window.open('/my/personal_page');
};

onMounted(() => {
    if (projectId) {
        getProjectDetailData();
        if (token) {
            getJoinOrNot(projectId as string);
        }
    }
    if (inviteId) {
        globalStore.setInviteId(inviteId as string);
    }
});
onUnmounted(() => {
    //离开时清除数据
    clearStoreData();
});

watch(noteModel, (newNoteValue) => {
    setCurNoteModalData({
        ...(curNoteModalData.value || {}),
        content: newNoteValue
    });
});
</script>

<template>
    <div class="project-read-page-root">
        <Title
            :value="`项目阅读${detailData?.name ? `-${detailData.name}` : ''} - 源码阅读交流平台`"
        />
        <ARow align="middle" class="head" justify="space-between">
            <ACol class="cp" @click="goBack">
                <LeftOutlined class="icon-back mr" />
                <AAvatar
                    shape="square"
                    :size="24"
                    :src="processOSSLogo(detailData?.logo, false) || null"
                >
                    <template #icon>
                        <Logo />
                    </template>
                </AAvatar>
                <span class="project-name pl">{{ detailData?.name || '项目名' }}</span>
            </ACol>
            <ACol>
                <ASpace align="center" size="large">
                    <template v-if="!!token">
                        <div
                            v-if="!isJoined"
                            class="join cp"
                            @click="
                                () => {
                                    setRightShowMode('join');
                                }
                            "
                        >
                            <PlusCircleOutlined class="icon-join" />
                            <span class="join-text">加入项目，查看全部注解</span>
                        </div>
                        <AAvatar
                            class="cp"
                            @click="openMyPage"
                            shape="square"
                            :size="26"
                            :src="processOSSLogo(userInfo?.avatar, true) || null"
                        >
                            <template #icon>
                                <UserOutlined />
                            </template>
                        </AAvatar>
                    </template>

                    <div
                        v-else
                        class="orange cp"
                        @click="
                            () => {
                                setRightShowMode('login');
                            }
                        "
                    >
                        <UserOutlined :size="20" />
                        &nbsp;
                        <span class="login-text">请登录</span>
                    </div>

                    <span title="分享">
                        <ShareAltOutlined class="icon-share" @click="handleShareClick" />
                    </span>
                    <CloseCircleOutlined @click="goBack" />
                </ASpace>
            </ACol>
        </ARow>
        <main class="main">
            <Left />
            <Middle :openNoteModal="handleOpenNoteModal" />
            <Right :openNoteModal="handleOpenNoteModal" />
        </main>

        <CommentModal
            autoFocus
            @cancel="
                () => {
                    setCurNoteModalData({ ...curNoteModalData!, visible: false });
                }
            "
            @ok="handleCommentModalOk"
            :open="!!curNoteModalData?.visible"
            getContainer="#right-part"
            type="drawer"
            v-model="noteModel"
        >
            <template #title><component v-if="modalTitle" :is="modalTitle" /></template>
        </CommentModal>
    </div>
</template>

<style scoped lang="less">
.project-read-page-root {
    width: 100%;
    display: flex;
    height: 100vh;
    flex-direction: column;
    flex-wrap: nowrap;

    .head {
        height: 46px;
        padding: 8px 10px;

        .ant-col {
            font-size: 18px;
        }

        .project-name {
            font-size: 16px;
            font-weight: bold;
        }

        .login-text {
            font-size: 16px;
        }

        .join {
            display: inline-block;
            font-size: 16px;
            padding-right: 24px;

            .join-text {
                padding-left: 6px;
                color: #ff8303;
            }
        }
    }

    & > .main {
        display: flex;
        flex: 1;
        height: 0;
    }
}
</style>
