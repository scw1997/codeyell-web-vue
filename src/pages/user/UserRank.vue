<script setup lang="ts">
import { Title } from '@/components';
import { Empty } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import RankItem from './UserRankItem.vue';
import http from '@/utils/http';
import api from '@/api';

const states = ref({
    count_comment: [],
    count_comment_recent: [],
    count_liked: [],
    count_liked_recent: []
});

//获取数据
const getData = async () => {
    const data = await http.get(api.rank.getRankData);
    states.value = data;
};
onMounted(() => {
    getData();
});
</script>
<template>
    <div class="rank-page-root">
        <Title value="排行榜 - 源码阅读交流平台" />
        <h2>
            周榜
            <span class="desc">（最近7天）</span>
        </h2>
        <ARow align="middle" :gutter="15" justify="space-between">
            <ACol :span="12">
                <ACard>
                    <section class="title">注解榜</section>
                    <main class="rank-list">
                        <template v-if="states.count_comment_recent?.length > 0">
                            <RankItem
                                v-for="(item, index) in states.count_comment_recent"
                                :data="item"
                                :key="index"
                            />
                        </template>

                        <Empty
                            v-else
                            description="暂无数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </main>
                </ACard>
            </ACol>
            <ACol :span="12">
                <ACard>
                    <section class="title">点赞榜</section>
                    <main class="rank-list">
                        <template v-if="states.count_liked_recent?.length > 0">
                            <RankItem
                                v-for="(item, index) in states.count_liked_recent"
                                :data="item"
                                :key="index"
                            />
                        </template>

                        <Empty
                            v-else
                            description="暂无数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </main>
                </ACard>
            </ACol>
        </ARow>

        <h2>总榜</h2>
        <ARow align="middle" :gutter="15" justify="space-between">
            <ACol :span="12">
                <ACard>
                    <section class="title">注解榜</section>
                    <main class="rank-list">
                        <template v-if="states.count_comment?.length > 0">
                            <RankItem
                                v-for="(item, index) in states.count_comment"
                                :data="item"
                                :key="index"
                            />
                        </template>

                        <Empty
                            v-else
                            description="暂无数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </main>
                </ACard>
            </ACol>
            <ACol :span="12">
                <ACard>
                    <section class="title">点赞榜</section>
                    <main class="rank-list">
                        <template v-if="states.count_liked?.length > 0">
                            <RankItem
                                v-for="(item, index) in states.count_liked"
                                :data="item"
                                :key="index"
                            />
                        </template>

                        <Empty
                            v-else
                            description="暂无数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </main>
                </ACard>
            </ACol>
        </ARow>
    </div>
</template>

<style scoped lang="less">
.rank-page-root {
    align-self: flex-start;
    width: 100%;

    .title {
        font-size: 18px;
        font-weight: bold;
    }

    h2 {
        font-size: 18px;
        font-weight: bold;
        margin-top: 0.5em;
        .desc {
            color: #868a8e;
        }
    }
}
</style>
