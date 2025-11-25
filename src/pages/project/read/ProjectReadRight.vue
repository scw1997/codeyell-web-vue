<script setup lang="ts">
import api from '@/api';
import { CommentItem, NoteItem, Pagination } from '@/components';
import Auth from './ProjectReadRightAuth.vue';

import { CaretRightOutlined } from '@ant-design/icons-vue';
import { Empty, Switch } from 'ant-design-vue';
import useGlobalStore from '@/store/global';
import useReadStore, { CurNoteModalData } from '@/store/read';
import { storeToRefs } from 'pinia';
import { useLocation } from 'swico/vue';
import { ref, watch } from 'vue';
interface PropsType {
    openNoteModal: (type: CurNoteModalData['mode'], record?: Record<string, any>) => void; //打开注解弹窗
}

interface StatesType {
    noteListData: any[];
    noteParams: null | Record<string, any>;
}
const route = useLocation();
const { id: projectId } = route.query;
const globalStore = useGlobalStore();
const readStore = useReadStore();
const { getNoteLineDataByFile, setRightAutoVisible, setTabList, setNoteListPageRef } = readStore;
const { tabList, activeTab, rightShowMode, curNoteFileData, rightAutoVisible, noteListPageRef } =
    storeToRefs(readStore);
const props = defineProps<PropsType>();
const states = ref<StatesType>({
    noteListData: [],
    noteParams: {}
});

const getNoteListData = async () => {
    const noteFileData = curNoteFileData.value;
    states.value.noteParams = {
        project_id: projectId,
        file_id: noteFileData?.fileId, //针对哪个文件的注解，
        path: noteFileData?.filePath, //代码文件路径
        start_line: noteFileData?.startLine,
        end_line: noteFileData?.endLine
    };
};

const handleRefresh = async (type: 'delete') => {
    const { pageNo, getData } = noteListPageRef.value || {};
    const data = await getData?.(pageNo as number);
    //如果是删除注解后的刷新注解列表操作，若查询注解列表为空，则需要更新当前文件的noteLineData数据使对应代码行下划线样式清除
    if (pageNo === 1 && data!.length === 0) {
        const { name, fileId, key } = activeTab.value!;
        const noteLineData = await getNoteLineDataByFile(projectId! as string, name, fileId);
        const newTabList = tabList.value.slice();
        const activeTabIndex = tabList.value.findIndex((item) => item.key === key);
        if (activeTabIndex !== -1) {
            newTabList[activeTabIndex] = { ...activeTab.value!, noteLineData };
        }
        setTabList(newTabList);
    }
};

watch([curNoteFileData, rightShowMode], ([newCurNoteFileData, newRightShowMode]) => {
    if (
        newCurNoteFileData &&
        newRightShowMode === 'note' &&
        newCurNoteFileData?.createMode !== 'createInNotes'
    ) {
        getNoteListData();
    }
});

const handleNoteListChange = (data) => {
    states.value.noteListData = data;
};
</script>

<template>
    <div
        id="right-part"
        :class="{ 'project-read-right-section-root': true, hide: rightShowMode === 'hidden' }"
    >
        <ARow align="middle" class="right-head" justify="space-between">
            <template v-if="!!curNoteFileData">
                <ACol flex="1">
                    注解列表
                    <CaretRightOutlined />
                    <span class="title-text">
                        <ATooltip :title="curNoteFileData.filePath">
                            <span class="file-name">
                                {{ curNoteFileData.shortFilePath }}
                            </span>
                        </ATooltip>
                        （起始行:
                        <span class="start-line-number">
                            {{ curNoteFileData.startLine }}
                        </span>
                        结束行:
                        <span class="end-line-number">{{ curNoteFileData.endLine }}</span>
                        ）
                    </span>
                </ACol>
                <ACol flex="none">
                    <ATooltip title="是否自动显示注解">
                        <Switch
                            :checked="rightAutoVisible"
                            checked-children="自动显示"
                            un-checked-children="手动显示"
                            @change="
                                (value) => {
                                    setRightAutoVisible(value as boolean);
                                }
                            "
                        />
                    </ATooltip>
                </ACol>
            </template>

            <ACol v-else flex="1">
                注解列表
                <CaretRightOutlined />
            </ACol>
        </ARow>
        <Auth>
            <div v-if="!!curNoteFileData" id="right-main" class="main-content">
                <div class="note-list">
                    <div
                        v-for="(noteItem, index) in states.noteListData"
                        :key="index"
                        class="note-item pb"
                    >
                        <NoteItem
                            class="mb"
                            :data="noteItem"
                            :refresh="handleRefresh"
                            type="read"
                            @edit="(record) => openNoteModal('edit', record)"
                            @reply="(record) => openNoteModal('reply', record)"
                        />

                        <div v-if="noteItem.children?.length > 0" class="comment-list">
                            <CommentItem
                                v-for="(childrenItem, index) in noteItem.children"
                                :key="index"
                                :class="{
                                    pb: index !== noteItem.children?.length - 1,

                                    'comment-item': true
                                }"
                                :data="childrenItem"
                                :refresh="handleRefresh"
                                type="read"
                                @edit="(record) => openNoteModal('edit', record)"
                                @reply="(record) => openNoteModal('childReply', record)"
                            />
                        </div>
                    </div>

                    <ARow v-if="states.noteListData.length === 0" align="middle" justify="center">
                        <ACol flex="none">
                            <Empty description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                        </ACol>
                    </ARow>

                    <Pagination
                        :ref="
                            (ref1) => {
                                setNoteListPageRef(ref1);
                            }
                        "
                        class="mt"
                        :params="states.noteParams"
                        :url="api.code.getNoteListByLine"
                        @change="
                            (data) => {
                                handleNoteListChange(data);
                            }
                        "
                    />
                </div>

                <ARow
                    class="note-input-bar"
                    :gutter="14"
                    @click="
                        openNoteModal('createInNotes', {
                            start_line: curNoteFileData.startLine,
                            end_line: curNoteFileData.endLine
                        })
                    "
                >
                    <ACol flex="1">
                        <AInput placeholder="输入内容发表注解" read-only />
                    </ACol>
                    <ACol flex="none">
                        <AButton type="primary">
发表注解
</AButton>
                    </ACol>
                </ARow>
            </div>

            <Empty
                v-else
                description="请点击一处含注解的代码区域"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
        </Auth>
    </div>
</template>

<style scoped lang="less">
.project-read-right-section-root {
    flex: 1;
    display: flex;
    height: calc(100vh - var(--readPageHeaderHeigt));
    flex-direction: column;
    position: relative;

    .right-head {
        background-color: #f2f2f2;
        flex: none;
        min-height: 36px;
        padding: 0 12px;

        .title-text {
            .file-name {
                padding-right: 10px;
                color: #c97c0a;
            }

            .start-line-number {
                padding-right: 10px;
                color: #f3aa26;
            }

            .end-line-number {
                color: #f3aa26;
            }
        }
    }

    & > .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 0;
        padding: 10px 14px;

        .note-list {
            overflow: auto;
            flex: 1;
            height: 100%;

            .comment-list {
                padding: 10px;
                background-color: #f8f8f8;
            }

            .finish-text {
                color: #868a8e;
            }
        }

        .note-input-bar {
            padding-top: 10px;
            flex: none;
        }
    }
}
</style>
