<script setup lang="ts">
import { authFunc } from '@/utils/tools';
import { defineComponent, h } from 'vue';
import { Modal, Space, Textarea } from 'ant-design-vue';

// const props = defineProps<{ a: number }>();
// const { a } = props;
// const emits = defineEmits<{ (e: 'test'): void }>();

const click = () => {
    const modalTitle = defineComponent({
        components: {
            ASpace: Space
        },
        props: ['type'],
        template:
            '<ASpace>  <span v-if="type">{{type === "detail" ? "举报评论" : "举报注解"}}</span></ASpace>'
    });

    const content = defineComponent({
        components: {
            ATextarea: Textarea
        },
        methods: {
            handleChange(e) {}
        },
        template:
            '<div><ATextarea :maxlength="300" placeholder="填写举报原因" @change="handleChange"/></div>'
    });

    Modal.confirm({
        title: h(modalTitle, { type: 'xxx' }),
        class: 'complaint-modal',
        width: 600,
        maskClosable: true,
        // onOk: handleComplaintComment,
        footer: null,
        content: h(content, null)
    });
};
</script>
<template><button @click="click">xxxx</button></template>

<style scoped></style>
