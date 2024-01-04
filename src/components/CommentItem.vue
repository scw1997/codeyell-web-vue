<script setup lang="ts">
import api from '@/api';
import { ParsedContent, Toast } from '@/components';
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
import { Avatar, Col, Dropdown, Input, MenuProps, Modal, Row, Space } from 'ant-design-vue';
</script>

<template>
    <div :class="`comment-item-component-root ${className}`"></div>
</template>

<style scoped lang="less"></style>
