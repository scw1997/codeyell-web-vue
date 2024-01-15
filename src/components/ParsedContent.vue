<!--将markdown语法渲染成html内容的组件-->
<script lang="ts" setup>
import hljs from 'highlight.js';
// @ts-ignore
import { marked } from 'marked';
import 'highlight.js/styles/base16/onedark.css';
// @ts-ignore
import { ImagePreviewType } from 'rc-image';
import { ref } from 'vue';

// 配置marked
const renderer = new marked.Renderer();
// 配置链接，点击链接时，打开新的浏览器窗口
renderer.link = (href: string, title: string, text: string) => {
    return `<a target="_blank" href="${href}" title="${title}">${text}</a>`;
};
marked.setOptions({
    renderer: renderer,
    highlight: function (code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
});

interface PropsType {
    content: string; //markdown语法字符串
}

const { content } = withDefaults(defineProps<PropsType>(), { content: '' });

const previewConfig = ref<ImagePreviewType>({
    src: undefined,
    visible: false
});

//将原始的markdown格式内容字符串转换成富文本html样式内容
const parsedContent = marked.parse(content || '');

//处理图片内容的预览效果
const handleContentClick = (e) => {
    const target: HTMLElement = e.target;
    if (target.nodeName === 'IMG') {
        previewConfig.value = {
            visible: true,
            src: e.target.currentSrc
        };
    }
};
</script>

<template>
    <div class="parsed-content-component-root">
        <AImage
            v-if="previewConfig?.src && previewConfig.visible"
            class="image"
            :preview="{
                visible: previewConfig?.visible,
                src: previewConfig.src,
                onVisibleChange: (value) => {
                    previewConfig.value = { ...previewConfig, visible: value };
                }
            }"
            :src="previewConfig.src"
            style="display: none"
            :width="200"
        />

        <div class="main-content" v-html="parsedContent" @click="handleContentClick"></div>
    </div>
</template>

<style scoped lang="less">
.parsed-content-component-root {
    .ant-image {
        display: block;
    }

    .main-content {
        :deep(p) {
            margin: 4px 0;
        }

        :deep(code) {
            margin: 0 2px;
            padding: 6px 8px;
            border-radius: 6px;
            background-color: #eeeeee;
            vertical-align: bottom;
            line-height: 1.5;
            word-break: break-all;
        }

        :deep(img) {
            max-width: 200px;
            max-height: 200px;
            object-fit: contain;
            object-position: center;
        }
    }
}
</style>
