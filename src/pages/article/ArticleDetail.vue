<script setup lang="ts">
import { Title, ParsedContent } from '@/components';
import http from '@/utils/http';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import { App, TypographyLink, QRCode } from 'ant-design-vue';
import { useLocation, useNav } from 'swico';
import { defineComponent, h, onMounted, ref } from 'vue';
import { ShareAltOutlined } from '@ant-design/icons-vue';
import api from '@/api';
import { history } from 'swico';
interface StatesType {
    detailData: Record<string, any> | null; //当前文章详情信息
}

const globalStore = useGlobalStore();
const route = useLocation();
const { userInfo } = storeToRefs(globalStore);
const nav = useNav();

const { id: articleID, invite_id: inviteId } = route.query;
const { modal } = App.useApp();

const states = ref<StatesType>({
    detailData: null
});

//未携带项目id参数
if (!articleID) {
    nav('/404', { replace: true });
}

//点击分享按钮
const handleShareClick = () => {
    const shareUrl = `${window.location.href}${
        userInfo.value?.id ? `&invite_id=${userInfo.value.id}` : ''
    }`;

    const content = /*#__PURE__*/ defineComponent({
        components: {
            TypographyLink,
            QRCode
        },
        props: {
            shareUrl: {
                default: shareUrl
            }
        },
        template: `   <div>
            <section>
                <TypographyLink copyable>{{shareUrl}}</TypographyLink>
        </section>
        <section>
        <h3>分享二维码</h3>
        <QRCode :value="shareUrl" />
  </section>
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

//获取当前项目信息
const getArticleDetailData = async () => {
    const data = await http.post(api.article.getArticleDetail, {
        article_system_id: articleID
    });
    states.value.detailData = data;
    return data;
};

onMounted(() => {
    getArticleDetailData();
});
</script>

<template>
    <div class="article-page-root">
        <Title
            :value="`${
                states?.detailData?.title ? `${states?.detailData.title}` : ''
            } - 源码阅读交流平台`"
        />
        <ACard class="top-card mb">
            <ARow align="middle" justify="space-between">
                <ACol flex="1" style="width: 0">
                    <ASpace size="middle">
                        <span class="project-name ellipsis">
                            {{ states?.detailData?.title || '加载中' }}
                        </span>
                    </ASpace>
                </ACol>
                <ACol class="project-msg" flex="none">
                    <ASpace size="middle">
                        <span title="分享">
                            <ShareAltOutlined
                                class="cp"
                                @click="handleShareClick"
                                style="font-size: 20px"
                            />
                        </span>
                    </ASpace>
                </ACol>
            </ARow>
        </ACard>
        <ACard class="bottom-card">
            <div>
                <ARow align="middle" class="pb" justify="space-between">
                    <ParsedContent :content="states.detailData?.content" />
                </ARow>
            </div>
        </ACard>
    </div>
</template>

<style scoped lang="less">
.article-page-root {
    width: 100%;

    .bottom-card {
        min-height: 400px;
    }
}
</style>
