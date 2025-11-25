<!--//单条二级评论组件-->
<script setup lang="ts">
import api from '@/api';
import { ParsedContent } from '@/components';
import { history, useNav } from 'swico/vue';
import useGlobalStore from '@/store/global';
import http from '@/utils/http';
import { authFunc, dateFormat, EMPTY, processOSSLogo } from '@/utils/tools';
import {
    CaretRightOutlined,
    DislikeFilled,
    DislikeOutlined,
    EllipsisOutlined,
    LikeFilled,
    LikeOutlined,
    MessageOutlined,
    UserOutlined
} from '@ant-design/icons-vue';
import { MenuProps, Menu, Space, Textarea, Modal, App } from 'ant-design-vue';
import { defineComponent, h, ref, render, toRefs, watch } from 'vue';
import useReadStore from '@/store/read';
import Toast from '@/utils/Toast';
import { storeToRefs } from 'pinia';
import { MenuClickEventHandler } from 'ant-design-vue/es/menu/src/interface';

interface PropsType {
    data: Record<string, any>; //当前评论相关数据
    type?: 'detail' | 'read';
    refresh?: (type: 'delete') => void; //触发刷新列表，点赞相关/删除/举报等操作成功后调用
}

const props = defineProps<PropsType>();
const emits = defineEmits<{
    reply: [record: PropsType['data']]; //点击回复
    edit: [record: PropsType['data']]; //点击修改
}>();

const { isJoined, setRightShowMode } = useReadStore();
const nav = useNav();
const { userInfo, token } = storeToRefs(useGlobalStore());
const { modal } = App.useApp();
let complaintValue = ref<string>('');

const dropdownItems = ref<MenuProps['items']>([]);
const likeStates = ref<{ count_liked: number; count_unliked: number; is_liked: number | null }>({
    count_liked: 0,
    count_unliked: 0,
    is_liked: null
});

watch(
    [userInfo, () => props.data],
    ([newUserInfo, newPropsData]) => {
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
    },
    { immediate: true }
);

//举报评论/注解
const handleComplaintComment = async () => {
    const { id } = props.data;
    const reason = complaintValue.value;
    if (!reason) {
        const msg = '举报原因不可为空';
        Toast.info(msg);
        return Promise.reject(msg);
    }
    Toast.loading(true);
    await http.post(api.global.complaintComment, {
        content_id: id, //内容id，content_type=1时，是评论的id, content_type=2时，是注解的id
        content_type: props.type === 'detail' ? 1 : 2, //内容类型，1 项目评论 2代码注解
        reason //原因说明，可选
    });
    Toast.success('举报成功');
};

//删除评论/注解
const handleDelComment = async () => {
    const { project_id, id } = props.data;
    Toast.loading(true);
    await http.post(props.type === 'detail' ? api.comment.deleteComment : api.code.deleteNote, {
        project_id,
        comment_id: id
    });
    Toast.success('删除成功');
    props.refresh('delete');
};

//跳转到指定用户公开页
const jumpToPublicUserPage = (userid: number) => {
    const { user_info } = props.data;
    if (user_info && userid === userInfo.value?.id) {
        //如果点击是登录人自己的头像信息，则跳转到我的个人首页

        if (props.type === 'read') {
            window.open('/my/personal_page');
        } else {
            nav({ name: 'my-personal' });
        }
    } else {
        //其他用户头像
        if (props.type === 'read') {
            window.open(`/user/public?id=${userid}`);
        } else {
            nav({ name: 'user-public', query: { id: userid } });
        }
    }
};
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
            '<div><ATextarea :maxlength="300" placeholder="填写举报原因" @change="handleChange" :rows="5"/></div>'
    });

    modal.confirm({
        title: h(modalTitle, { type: props.type }),
        class: 'complaint-modal',
        width: 600,
        maskClosable: true,
        onOk: handleComplaintComment,
        footer: null,
        content: h(content, null)
    });
};
const handleMenuClick: MenuClickEventHandler = ({ item, keyPath, key }) => {
    switch (key) {
        case 'edit':
            emits('edit', props.data);
            break;
        case 'delete':
            handleDelComment();
            break;
        case 'complaint':
            openComplaintModal();
            break;
    }
};

//赞成/反对（注解模式）
const handleAgreeOrDisagree = async (isLike: boolean) => {
    const { user_id, project_id, id } = props.data;
    if (!token || !isJoined) {
        setRightShowMode(!token ? 'login' : 'join');
        return;
    }
    if (user_id && user_id === userInfo.value?.id) {
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
    const likeData = await http.post(api.code.agreeOrDisagreeNote, {
        project_id: project_id,
        comment_id: id,
        is_like: isLikeParam //1点赞2反对3中立
    });
    Toast.success(msg);
    const { count_liked, count_unliked, is_like } = likeData;
    likeStates.value = { count_liked, count_unliked, is_liked: is_like };
};
</script>

<template>
    <div class="comment-item-component-root">
        <ARow class="top" :gutter="15" justify="space-between">
            <ACol flex="none">
                <AAvatar
                    class="cp"
                    shape="square"
                    :size="30"
                    :src="processOSSLogo(data?.user_info?.avatar, true) || null"
                    @click="jumpToPublicUserPage(data?.user_info?.id)"
                >
                    <template #icon>
                        <UserOutlined />
                    </template>
                </AAvatar>

                <span v-if="data?.reply_to" class="name">
                    <span class="cp" @click="jumpToPublicUserPage(data?.user_info?.id)">
                        {{ data?.user_info?.nickname || '昵称' }}
                    </span>
                    <CaretRightOutlined class="arrow" />
                    <span class="cp" @click="jumpToPublicUserPage(data?.reply_to?.id)">
                        {{ data?.reply_to?.nickname || '昵称' }}
                    </span>
                </span>

                <span v-else class="name cp" @click="jumpToPublicUserPage(data?.user_info?.id)">
                    {{ data?.user_info?.nickname }}
                </span>
            </ACol>

            <ACol v-if="type === 'read' && userInfo">
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
            <section class="comment">
                <ParsedContent :content="data.content" />
            </section>
            <section class="footer">
                <span class="date">
                    {{ data.created_at ? dateFormat(data.created_at).slice(0, 16) : '发表时间' }}
                </span>
                <ASpace size="middle">
                    <div v-if="type === 'detail'">
                        <LikeOutlined v-if="data?.is_liked === 0" class="cp" />
                        <LikeFilled v-else class="cp" />
                        <span class="like-amount">{{ data?.count_liked || 0 }}</span>
                    </div>

                    <template v-if="type === 'read'">
                        <div>
                            <LikeFilled
                                v-if="likeStates?.is_liked === 1"
                                class="cp"
                                @click="() => handleAgreeOrDisagree(true)"
                            />
                            <LikeOutlined
                                v-else
                                class="cp"
                                @click="() => handleAgreeOrDisagree(true)"
                            />
                            <span class="like-amount">{{ likeStates?.count_liked || 0 }}</span>
                        </div>

                        <span class="unlike-amount">
                            <DislikeFilled
                                v-if="likeStates?.is_liked === 2"
                                class="cp"
                                @click="() => handleAgreeOrDisagree(false)"
                            />

                            <DislikeOutlined
                                v-else
                                class="cp"
                                @click="() => handleAgreeOrDisagree(false)"
                            />
                            <span class="amount">{{ likeStates?.count_unliked || 0 }}</span>
                        </span>
                    </template>

                    <div
                        v-if="type === 'read'"
                        class="cp"
                        @click="
                            () => {
                                emits('reply', data);
                            }
                        "
                    >
                        <MessageOutlined />
                        <span class="reply">回复</span>
                    </div>
                </ASpace>
            </section>
        </div>
    </div>
</template>

<style scoped lang="less">
.comment-item-component-root {
    .top {
        .name {
            padding-left: 6px;
            color: #626b7d;

            .arrow {
                padding: 0 6px;
            }
        }
    }

    .main {
        .comment {
            padding: 8px 0;
        }

        .footer {
            display: flex;
            justify-content: space-between;

            .date {
                color: #868a8e;
            }

            .like-amount,
            .reply {
                padding-left: 4px;
            }
        }
    }
}
</style>
