<script setup lang="ts">
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import { ref, toRefs, watch, h, defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { dateFormat, processOSSLogo } from '@/utils/tools';
import { ParsedContent, Logo } from '@/components';
import { Modal, Space, Textarea } from 'ant-design-vue';
import {
    DislikeFilled,
    DislikeOutlined,
    EllipsisOutlined,
    LikeFilled,
    LikeOutlined,
    MessageOutlined,
    UserOutlined
} from '@ant-design/icons-vue';

import { MenuProps, Menu } from 'ant-design-vue';
import useReadStore from '@/store/read';
import Toast from '@/utils/Toast';
import api from '@/api';
import http from '@/utils/http';
import { MenuClickEventHandler } from 'ant-design-vue/es/menu/src/interface';
interface PropsType {
    type?: 'user' | 'index' | 'detail' | 'read'; //展示样式类型，用户资料页/首页/项目详情页/项目阅读页
    data: Record<string, any>; //数据源
}
const { userInfo, token } = storeToRefs(useGlobalStore());
const readStore = useReadStore();
const { setRightShowMode } = readStore;
const { isJoined } = storeToRefs(readStore);
const props = defineProps<PropsType>();

const { type, data } = toRefs(props);

const emits = defineEmits<{
    reply: [record: PropsType['data']]; //点击回复
    edit: [record: PropsType['data']]; //点击修改
    refresh: [type: 'delete']; //触发刷新列表，点赞相关/删除/举报等操作成功后调用
}>();
//
const router = useRouter();
const dropdownItems = ref<MenuProps['items']>([]);
const likeStates = ref<{ count_liked: number; count_unliked: number; is_liked: number | null }>({
    count_liked: data?.value.count_liked,
    count_unliked: data?.value.count_unliked,
    is_liked: data?.value.is_liked
});
let complaintValue = ref<string>('');

watch(data, (newValue) => {
    const { count_liked, count_unliked, is_liked } = newValue || {};
    likeStates.value = { count_liked, count_unliked, is_liked };
});

watch([userInfo, data], ([newUserInfo, newPropsData]) => {
    const newItems = [
        {
            key: 'edit',
            label: '修改',
            visible: newUserInfo && newPropsData?.user_id === newUserInfo?.id //仅作者可见
        },
        {
            key: 'delete',

            label: '删除',
            visible: newUserInfo && newPropsData?.user_id === newUserInfo?.id //仅作者可见
        },
        {
            key: 'complaint',
            label: '举报',
            visible: newUserInfo
        }
    ];

    dropdownItems.value = newItems.filter((item) => !!item.visible);
});

//跳转到项目阅读页
const jumpToProjectReadPage = (id: number) => {
    router.push({ name: 'project-read', query: { id } });
};

//跳转到指定用户公开页
const jumpToPublicUserPage = (userid: number) => {
    if (userInfo && userid === userInfo?.value.id) {
        //如果点击是登录人自己的头像信息，则跳转到我的个人首页

        if (type.value === 'read') {
            window.open('/my/personal_page');
        } else {
            router.push({ name: 'my-personal' });
        }
    } else {
        //其他用户头像
        if (type.value === 'read') {
            window.open(`/user/public?id=${userid}`);
        } else {
            router.push({ name: 'user-public', query: { id: userid } });
        }
    }
};

//跳转到项目详情页
const jumpToProjectDetailPage = (id: number) => {
    router.push({ name: 'project-detail', query: { id } });
};

//举报评论/注解
const handleComplaintComment = async () => {
    const { commentId } = props.data;
    const reason = complaintValue.value;
    if (!reason) {
        const msg = '举报原因不可为空';
        Toast.info(msg);
        return Promise.reject(msg);
    }
    Toast.loading(true);
    await http.post(api.global.complaintComment, {
        content_id: commentId, //内容id，content_type=1时，是评论的id, content_type=2时，是注解的id
        content_type: type.value === 'detail' ? 1 : 2, //内容类型，1 项目评论 2代码注解
        reason //原因说明，可选
    });
    Toast.success('举报成功');
};

//删除评论/注解
const handleDelComment = async () => {
    const { project_id, commentId } = props.data;
    Toast.loading(true);
    await http.post(type.value === 'detail' ? api.comment.deleteComment : api.code.deleteNote, {
        project_id,
        comment_id: commentId
    });
    Toast.success('删除成功');
    emits('refresh', 'delete');
};

//赞成/反对（注解模式）
const handleAgreeOrDisagree = async (isLike: boolean) => {
    const { project_id, commentId, user_id } = props.data;
    if (!token || !isJoined) {
        setRightShowMode(!token ? 'login' : 'join');
        return;
    }
    if (user_id.value && user_id.value === userInfo?.value?.id) {
        return Toast.info('不可赞成/反对自己发表的内容');
    }

    let isLikeParam = isLike ? 1 : 2,
        msg = isLike ? '已赞成' : '已反对';
    if (
        (isLike && likeStates.value.is_liked === 1) ||
        (!isLike && likeStates.value.is_liked === 2)
    ) {
        //重复点赞/反对则表示取消点赞/反对，即中立态度
        isLikeParam = 3;
        msg = isLike ? '取消赞成' : '取消反对';
    }

    Toast.loading(true);
    const data = await http.post(api.code.agreeOrDisagreeNote, {
        project_id,
        comment_id: commentId,
        is_like: isLikeParam //1点赞2反对3中立
    });
    Toast.success(msg);

    const { count_liked, count_unliked, is_like } = data;
    likeStates.value = { count_liked, count_unliked, is_liked: is_like };
};

//打开举报弹窗
const openComplaintModal = () => {
    const modalTitle = /*#__PURE__*/ defineComponent({
        components: {
            ASpace: Space
        },
        props: ['type'],
        template:
            '<ASpace>  <span v-if="type">{{type === "detail" ? "举报评论" : "举报注解"}}</span></ASpace>'
    });

    const content = /*#__PURE__*/ defineComponent({
        components: {
            ATextarea: Textarea
        },
        methods: {
            handleChange(e) {
                complaintValue.value = e.target.value;
            }
        },
        template:
            '<div><ATextarea :maxlength="300" placeholder="填写举报原因" @change="handleChange"/></div>'
    });

    Modal.confirm({
        title: h(modalTitle, { type }),
        class: 'complaint-modal',
        width: 600,
        maskClosable: true,
        onOk: handleComplaintComment,
        footer: null,
        content: h(content, null)
    });
};

const handleMenuClick: MenuClickEventHandler = ({ item, key, keyPath }) => {
    console.log('xxxx', item, key, keyPath);
    switch (key) {
        case 'edit':
            emits('edit', data);
            break;
        case 'delete':
            handleDelComment();
            break;
        case 'complaint':
            openComplaintModal();
            break;
    }
};
</script>

<template>
    <div class="note-item-component-root">
        <template v-if="type === 'index'">
            <ARow align="middle" class="header" justify="space-between">
                <ACol>
                    <AAvatar
                        class="cp"
                        @click="jumpToPublicUserPage(data.user_id)"
                        shape="square"
                        :size="40"
                        :src="processOSSLogo(data.user_info?.avatar, true) || null"
                    >
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </AAvatar>
                    <span class="user-name pl cp" @click="jumpToPublicUserPage(data.user_id)">
                        {{ data.user_info?.nickname || '昵称' }}
                    </span>
                    <span
                        class="project-name pl cp"
                        @click="jumpToProjectDetailPage(data.project?.id)"
                    >
                        @{{ data.project?.name || '项目名' }}
                    </span>
                </ACol>
            </ARow>
            <div class="main" style="padding-left: 50px">
                <section class="text">
                    <ParsedContent :content="data.content" />
                </section>
            </div>
            <div class="remark" style="padding-left: 50px">
                <span class="date">
                    {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : '发表时间' }}
                </span>

                <ASpace class="operation" size="large">
                    <span class="cp" title="被赞成数">
                        <LikeOutlined />

                        <span class="like-amount">{{ data.count_liked || 0 }}</span>
                    </span>
                </ASpace>
            </div>
        </template>

        <template v-else-if="type === 'user'">
            <ARow align="middle" class="header" justify="space-between">
                <ACol>
                    <AAvatar
                        class="cp"
                        @click="jumpToProjectDetailPage(data.project?.id)"
                        shape="square"
                        :size="40"
                        :src="processOSSLogo(data.project?.avatar, true) || null"
                    >
                        <template #icon>
                            <Logo />
                        </template>
                    </AAvatar>
                    <span class="file-name pl cp" @click="jumpToProjectReadPage(data.project?.id)">
                        {{ data.file_name || '文件名' }}
                    </span>
                    <span
                        class="project-name pl cp"
                        @click="jumpToProjectDetailPage(data.project?.id)"
                    >
                        @{{ data.project?.name || '项目名' }}
                    </span>
                </ACol>
            </ARow>
            <div class="main">
                <section class="text">
                    <ParsedContent :content="data.content" />
                </section>
            </div>
            <div class="remark">
                <span class="date">
                    {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : '发表时间' }}
                </span>

                <ASpace class="operation" size="large">
                    <span class="cp" title="被赞成数">
                        <LikeOutlined />
                        <span class="like-amount">{{ data.count_liked || 0 }}</span>
                    </span>
                </ASpace>
            </div>
        </template>

        <template v-else-if="type === 'detail'">
            <ARow align="middle" class="header" justify="space-between">
                <ACol>
                    <AAvatar
                        class="cp"
                        @click="jumpToPublicUserPage(data.user_id)"
                        shape="square"
                        :size="40"
                        :src="processOSSLogo(data.user_info?.avatar, true) || null"
                    >
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </AAvatar>
                    <span class="user-name pl cp" @click="jumpToPublicUserPage(data.user_id)">
                        {{ data.user_info?.nickname || '昵称' }}
                    </span>
                </ACol>
            </ARow>
            <div class="main" style="padding-left: 50px">
                <section class="text">
                    <ParsedContent :content="data.content" />
                </section>
            </div>
            <div class="remark" style="padding-left: 50px">
                <span class="date">
                    {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : '发表时间' }}
                </span>

                <ASpace class="operation" size="large">
                    <div>
                        <LikeOutlined class="cp" v-if="data.is_liked === 0" />

                        <LikeFilled class="cp" v-else />

                        <span class="like-amount">{{ data.count_liked || 0 }}</span>
                    </div>
                </ASpace>
            </div>
        </template>

        <template v-else-if="type === 'read'">
            <ARow align="middle" class="header" justify="space-between">
                <ACol>
                    <AAvatar
                        class="cp"
                        @click="jumpToPublicUserPage(data.user_id)"
                        shape="square"
                        :size="40"
                        :src="processOSSLogo(data.user_info?.avatar, true) || null"
                    >
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </AAvatar>
                    <span class="user-name pl cp" @click="jumpToPublicUserPage(data.user_id)">
                        {{ data.user_info?.nickname || '昵称' }}
                    </span>
                </ACol>

                <ACol v-if="userInfo">
                    <ADropdown>
                        <template #overlay>
                            <Menu :items="dropdownItems" @click="handleMenuClick"></Menu>
                        </template>
                        <span class="cp" style="font-weight: bold">
                            <EllipsisOutlined style="font-size: 22px" />
                        </span>
                    </ADropdown>
                </ACol>
            </ARow>
            <div class="main">
                <section class="text">
                    <ParsedContent :content="data.content" />
                </section>
            </div>
            <div class="remark">
                <span class="date">
                    {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : '发表时间' }}
                </span>

                <ASpace class="operation" size="large">
                    <div>
                        <LikeFilled
                            v-if="likeStates?.is_liked === 1"
                            class="cp"
                            @click="handleAgreeOrDisagree(true)"
                        />

                        <LikeOutlined v-else class="cp" @click="handleAgreeOrDisagree(true)" />
                        <span class="like-amount">{{ likeStates?.count_liked || 0 }}</span>
                    </div>
                    <span class="unlike-amount">
                        <DislikeFilled
                            v-if="likeStates?.is_liked === 2"
                            class="cp"
                            @click="handleAgreeOrDisagree(false)"
                        />

                        <DislikeOutlined v-else class="cp" @click="handleAgreeOrDisagree(false)" />
                        <span class="amount">{{ likeStates?.count_unliked || 0 }}</span>
                    </span>

                    <span
                        class="reply cp"
                        @click="
                            () => {
                                emits('reply', data);
                            }
                        "
                    >
                        <MessageOutlined />
                        <span class="amount">回复</span>
                    </span>
                </ASpace>
            </div>
        </template>
    </div>
</template>

<style scoped lang="less">
.note-item-component-root {
    padding-right: 10px;

    .header {
        .project-name {
            color: #868a8e;
            font-weight: bold;
        }

        .user-name {
            color: #626b7d;
        }

        .file-name {
            font-size: 16px;
            color: #9097a3;
        }
    }

    .main {
        .text {
            padding: 8px 0;
        }

        .images {
            padding: 20px 0;

            .ant-image:not(:last-child) {
                margin-right: 20px;
            }
        }
    }

    .remark {
        display: flex;
        justify-content: space-between;

        .date {
            color: #868a8e;
        }

        .operation {
            .like-amount {
                padding-left: 4px;
            }
        }
    }
}
</style>
