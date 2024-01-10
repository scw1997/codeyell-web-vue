<script setup lang="ts">
interface PropsType {
    className?: string;
    type?: 'user' | 'index' | 'detail' | 'read'; //展示样式类型，用户资料页/首页/项目详情页/项目阅读页
    data: Record<string, any>; //数据源
    // onReply?: (record: PropsType['data']) => void; //点击回复
    // onEdit?: PropsType['onReply']; //点击修改
    refresh?: (type: 'delete') => void; //触发刷新列表，点赞相关/删除/举报等操作成功后调用
}

// const props = defineProps();
</script>

<template>
    <div class="note-item-component-root">
        <template></template>
    </div>
</template>

<style scoped lang="less">
.note-item-component-root {
    padding-right: 10px;

    .header {
        .avatar {
        }

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
            }

            .reply {
            }
        }
    }
}
</style>
