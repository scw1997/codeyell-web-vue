<script setup lang="ts">
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import { Drawer } from 'ant-design-vue';
import { uploadFile } from '@/utils/tools';
import { h, isVNode, toRefs, useCssModule, watch } from 'vue';

import hljs from 'highlight.js';

VMdEditor.use(githubTheme, {
    Hljs: hljs
});

//markdown评论弹窗组件
interface PropsType {
    open: boolean;
    type: 'modal' | 'drawer';
    autoFocus?: boolean; //自动获取焦点
    getContainer?: string;
}

interface EmitsType {
    cancel: [];
    ok: [];
    [key: string]: any[];
}

const model = defineModel({ default: '' }); //评论内容
const props = defineProps<PropsType>();
const emits = defineEmits<EmitsType>();
const slots = defineSlots<{ title(): void }>();
const style = useCssModule('module');

//选择本地图片后的回调
const handleAddImg = async (events, inserImage, files: File) => {
    const file = files?.[0];
    const { url, name } = await uploadFile(file);
    inserImage({ url, desc: name });
};

watch(
    () => props.open,
    () => {
        if (props.autoFocus && props.open) {
            // @ts-ignore
            document.querySelector('.for-container textarea')?.focus();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="comment-modal-drawer">
        <Drawer
            v-if="type === 'drawer'"
            closable
            height="500px"
            :open="open"
            :get-container="getContainer"
            placement="bottom"
            :root-class-name="style.commentModalDrawer"
            @close="emits('cancel')"
        >
            <VMdEditor
                v-model="model"
                left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code "
                height="100%"
                :disabled-menus="[]"
                @upload-image="handleAddImg"
            />
            <template #title>
                <slot name="title" />
            </template>
            <template #footer>
                <ARow justify="space-between">
                    <span class="gray">发表无价值的注解很容易被删除或者惩罚</span>
                    <ASpace size="large">
                        <AButton type="default" @click="emits('cancel')">
取消
</AButton>
                        <AButton type="primary" @click="emits('ok')">
确定
</AButton>
                    </ASpace>
                </ARow>
            </template>
        </Drawer>
    </div>
</template>

<style lang="css" module="module">
.commentModalDrawer {
    position: absolute;
}
</style>
