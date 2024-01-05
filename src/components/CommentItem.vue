<script setup lang="ts">
import api from '@/api';
import { ParsedContent } from '@/components';
import readStore from '@/store/read';
import globalStore from '@/store/global';
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
import { MenuProps } from 'ant-design-vue';
</script>

<template>
    <div class="comment-item-component-root">
        <!--    <ARow class="top" :gutter="15" justify="space-between">-->
        <!--      <ACol flex="none">-->
        <!--        <AAvatar-->
        <!--            class="cp"-->

        <!--        @click=jumpToPublicUserPage(user_info?.id)-->
        <!--        shape="square"-->
        <!--        :size="30"-->
        <!--        src={processOSSLogo(user_info?.avatar,true) || null}-->
        <!--        >-->
        <!--          <template #icon><UserOutlined /></template>-->
        <!--        </AAvatar>-->
        <!--        {reply_to ? (-->
        <!--        <span className={'name '}>-->
        <!--        <span-->
        <!--            className={'cp'}-->
        <!--            onClick={jumpToPublicUserPage.bind(EMPTY, user_info?.id)}-->
        <!--        >-->
        <!--                                {user_info?.nickname || '昵称'}-->
        <!--                            </span>-->
        <!--        <CaretRightOutlined className={'arrow'} />-->
        <!--        <span-->
        <!--            className={'cp'}-->
        <!--            onClick={jumpToPublicUserPage.bind(EMPTY, reply_to?.id)}-->
        <!--        >-->
        <!--                                {reply_to?.nickname || '昵称'}-->
        <!--                            </span>-->
        <!--        </span>-->
        <!--        ) : (-->
        <!--        <span-->
        <!--            className={'name cp'}-->
        <!--        onClick={jumpToPublicUserPage.bind(EMPTY, user_info?.id)}-->
        <!--        >-->
        <!--        {user_info?.nickname}-->
        <!--        </span>-->
        <!--        )}-->
        <!--      </ACol>-->

        <!--      {type === 'read' && userInfo && (-->
        <!--      <Col>-->
        <!--        <Dropdown menu={{ items: dropdownItems }}>-->
        <!--          <span className={'cp'} style={{ fontWeight: 'bold' }}>-->
        <!--          <EllipsisOutlined style={{ fontSize: '22px' }} />-->
        <!--          </span>-->
        <!--        </Dropdown>-->
        <!--      </Col>-->
        <!--      )}-->
        <!--    </ARow>-->

        <!--    <div className={'main'}>-->
        <!--      <section className={'comment'}>-->
        <!--        <ParsedContent content={content} />-->
        <!--      </section>-->
        <!--      <section className={'footer'}>-->
        <!--                    <span className={'date'}>-->
        <!--                        {created_at ? dateFormat(created_at).slice(0, 16) : '发表时间'}-->
        <!--                    </span>-->
        <!--        <Space size={'middle'}>-->
        <!--          {likePartContent}-->

        <!--          {type === 'read' ? (-->
        <!--          <div className={'cp'} onClick={onReply?.bind(EMPTY, data)}>-->
        <!--            <MessageOutlined />-->
        <!--            <span className={'reply'}>回复</span>-->
        <!--          </div>-->
        <!--          ) : null}-->
        <!--        </Space>-->
        <!--      </section>-->
        <!--    </div>-->
    </div>
</template>

<style scoped lang="less"></style>
