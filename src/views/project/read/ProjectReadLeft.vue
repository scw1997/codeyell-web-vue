<script setup lang="ts">
import { CopyOutlined, SearchOutlined } from '@ant-design/icons-vue';
import {
    Badge,
    Empty,
    Tooltip,
    DirectoryTree,
    InputSearch,
    Collapse,
    CollapsePanel
} from 'ant-design-vue';
import { debounce, EMPTY } from '@/utils/tools';
import type { DataNode } from 'ant-design-vue/es/tree';
import http from '@/utils/http';
import api from '@/api';
import Toast from '@/utils/Toast';
import useReadStore from '@/store/read';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Key } from 'ant-design-vue/es/_util/type';
import { useSearch } from '@/use/projectRead';

interface StatesType {
    mode: 'directory' | 'search'; //查看模式，目录模式/搜索模式
    treeData: DataNode[]; //目录树数据源
}

//tree node类型
export interface TreeDataNode extends DataNode {
    path: string;
    fileId: string;
    key: string;
    shortPath: string;
    language?: string;

    [property: string]: any;
}

const readStore = useReadStore();
const router = useRouter();
const route = useRoute();
const { id: projectId } = route.query;
const {
    getShortPath,
    getNoteLineDataByFile,
    getFileContent,
    getFileSuffixTypeByPath,
    getLanguage,
    setTabList
} = readStore;
const { isJoined, tabList } = storeToRefs(readStore);

const states = ref<StatesType>({
    mode: 'directory',
    treeData: []
});

const { search, searchStates, setSearchStates } = useSearch(projectId as string);

const handleModeChange = (changeMode: StatesType['mode']) => {
    if (states.value.mode !== changeMode) {
        states.value.mode = changeMode;
    }
};

//更新指定父节点下属的子节点数据
const updateTreeData = (list: DataNode[], key, children: DataNode[]): DataNode[] =>
    //list为当前正在操作的层级列表数据
    list.map((node) => {
        if (node.key === key) {
            return {
                ...node,
                children
            };
        }
        if (node.children) {
            return {
                ...node,
                children: updateTreeData(node.children, key, children)
            };
        }
        return node;
    });

//加载指定路径下的文件数据
const handleLoadData = (dataNode: any) => {
    const { key, isLeaf } = dataNode;
    //只针对文件夹加载数据
    if (!isLeaf) {
        return getFileTreeData(key);
    } else {
        return Promise.resolve(false);
    }
};

//获取项目代码文件（相对路径）目录树
const getFileTreeData = async (dir?: string) => {
    //path不传则为根路径
    const data = await http.post(api.code.getCodeFileTree, {
        project_id: projectId,
        dir
    });
    const childrenData: TreeDataNode[] = data?.map((item: Record<string, any>) => {
        const { title, is_leaf = false, file_id } = item;
        const path = dir ? `${dir}/${title}` : title; //组成相对于根路径的完整绝对路径
        const shortPath = getShortPath(path);
        const fileType = getFileSuffixTypeByPath(title);
        return {
            title,
            path,
            fileId: file_id,
            key: path,
            shortPath,
            language: is_leaf ? getLanguage(fileType) : undefined,
            isLeaf: is_leaf //是否已到最后一层，无children
        };
    });
    states.value.treeData = dir
        ? updateTreeData(states.value.treeData, dir as string, childrenData)
        : childrenData;

    return true;
};

//选择某个文件
const handleTreeNodeSelect = async (
    selectedKeys: Key[],
    e: { node: TreeDataNode; selected: boolean }
) => {
    const { node, selected } = e;
    console.log('node', node);
    const { isLeaf, key, shortPath, language, path, fileId } = node;
    if (selected && isLeaf === true) {
        //选中某个文件
        const matchTabIndex = tabList.value?.findIndex((item) => item.key === key);

        //先重置现有tab的active状态
        const newTabList = tabList.value?.map((item) => ({ ...item, active: false }));

        if (matchTabIndex !== -1) {
            //之前已打开此文件，则不添加,直接使该文件active
            newTabList[matchTabIndex] = {
                ...tabList.value[matchTabIndex],
                active: true,
                line: undefined
            };
            setTabList(newTabList);
        } else {
            //之前没打开过，添加到tabList中
            //获取对应文件代码内容及其含注解的行数据
            Toast.loading(true);
            const [codeContent, noteLineData] = await Promise.allSettled([
                getFileContent(projectId! as string, key, language),
                getNoteLineDataByFile(projectId! as string, key, fileId)
            ]);

            Toast.loading(false);

            setTabList([
                ...newTabList,
                {
                    name: path,
                    shortName: shortPath,
                    content: codeContent?.status === 'rejected' ? '' : codeContent.value,
                    active: true,
                    key,
                    fileId,
                    language,
                    noteLineData: noteLineData?.status === 'rejected' ? [] : noteLineData.value
                }
            ]);
        }
    }
};

//将搜索数据中的行内容转成html字符串并关键字高亮
const getHtmlLineContent = (content: string) => {
    const keywords = searchStates.value.keywords;
    return `<span>${content.replace(
        keywords,
        `<span class="keyword-hl">${keywords}</span>`
    )}<span/>`;
};

//选择某项搜索数据
const handleResultItemSelect = async (filePath: string, lineNumber: number, fileId: string) => {
    const matchTabItemIndex = tabList.value.findIndex((item) => item.key === filePath);
    const newTabList = tabList.value.map((item) => ({ ...item, active: false }));
    if (matchTabItemIndex !== -1) {
        //如果该文件当前已打开,则使其active并跳转至指定line
        newTabList[matchTabItemIndex] = {
            ...tabList[matchTabItemIndex],
            active: true,
            line: lineNumber
        };
        console.log('newTaaaa', newTabList);
        setTabList(newTabList);
    } else {
        //获取代码内容
        const fileType = getFileSuffixTypeByPath(filePath);
        const language = getLanguage(fileType);
        //获取对应文件代码内容及其含注解的行数据
        Toast.loading(true);
        const [codeContent, noteLineData] = await Promise.allSettled([
            getFileContent(projectId! as string, filePath, language),
            getNoteLineDataByFile(projectId! as string, filePath, fileId)
        ]);

        Toast.loading(false);
        setTabList([
            ...newTabList,
            {
                name: filePath,
                shortName: getShortPath(filePath),
                content: codeContent?.status === 'rejected' ? '' : codeContent.value,
                active: true,
                key: filePath,
                fileId,
                line: lineNumber,
                language,
                noteLineData: noteLineData?.status === 'rejected' ? [] : noteLineData.value
            }
        ]);
    }
};

onMounted(() => {
    getFileTreeData();
});
</script>

<template>
    <div class="project-read-left-section-root">
        <div class="resize-bar"></div>
        <div class="resize-line"></div>
        <div class="resize-save">
            <div class="left-head">
                <CopyOutlined
                    :class="{ mr: true, icon: true, active: states.mode === 'directory' }"
                    @click="handleModeChange('directory')"
                />
                <SearchOutlined
                    :class="{ icon: true, active: states.mode === 'search' }"
                    @click="handleModeChange('search')"
                />
            </div>

            <Collapse
                v-if="states.mode === 'directory'"
                class="directory"
                :defaultActiveKey="['1']"
            >
                <CollapsePanel header="FILES" key="1">
                    <main class="directory-main">
                        <DirectoryTree
                            v-if="states.treeData.length > 0"
                            :key="String(isJoined)"
                            :loadData="handleLoadData"
                            multiple
                            @select="handleTreeNodeSelect"
                            :treeData="states.treeData"
                        />
                        <Empty
                            v-else
                            description="暂无文件数据"
                            :image="Empty.PRESENTED_IMAGE_SIMPLE"
                        />
                    </main>
                </CollapsePanel>
            </Collapse>

            <div class="search" v-else>
                <section class="title mb">SEARCH</section>

                <InputSearch @search="search" placeholder="输入关键字" size="large">
                    <template #suffix>
                        <Tooltip
                            :class="{ 'case-text': true, cp: true, active: searchStates.isCase }"
                            title="是否区分大小写"
                        >
                            <span
                                @click="
                                    () => {
                                        setSearchStates({ isCase: !searchStates.isCase });
                                    }
                                "
                            >
                                Aa
                            </span>
                        </Tooltip>
                    </template>
                </InputSearch>
                <section class="pt pb">
                    {{ searchStates.resultsNum }} results in {{ searchStates.filesNum }} file
                </section>

                <Collapse
                    v-if="searchStates.data?.length > 0"
                    class="collapse-root"
                    :defaultActiveKey="searchStates.data.map((item) => item.FileID)"
                >
                    <CollapsePanel
                        v-for="{ FileName, Rows = [], FileID } in searchStates.data"
                        :key="FileID"
                    >
                        <template #header>
                            <ARow>
                                <ACol flex="1">{{ FileName }}</ACol>
                                <ACol flex="none" style="padding-left: 8px">
                                    <Badge color="#878787" :count="Rows.length" showZero />
                                </ACol>
                            </ARow>
                        </template>

                        <ARow
                            v-for="({ Line, LineNumber }, index) in Rows"
                            align="middle"
                            class="result-item cp"
                            :key="index"
                            @click="handleResultItemSelect(FileName, LineNumber, FileID)"
                        >
                            <!-- eslint-disable -->
                            <ACol
                                class="line-content"
                                v-html="getHtmlLineContent(Line)"
                                flex="1"
                            ></ACol>
                            <ACol class="line-number" flex="none">Line {{ LineNumber }}</ACol>
                        </ARow>
                    </CollapsePanel>
                </Collapse>

                <Empty v-else description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.project-read-left-section-root {
    position: relative;
    overflow: auto;
    background-color: #eaeaea;

    height: calc(100vh - var(--readPageHeaderHeigt));
    flex: none;

    .resize-save {
        position: absolute;
        top: 0;
        right: 5px;
        bottom: 0;
        left: 0;
        overflow-x: hidden;

        .left-head {
            padding: 8px 12px;
            font-size: 16px;
            background-color: #eaeaea;

            .icon {
                color: #bfbfbf;

                &.active {
                    color: #222;
                }
            }
        }

        .directory {
            &.ant-collapse:deep(.ant-collapse-item > .ant-collapse-header) {
                background-color: #ddd;
                padding: 6px 12px;
            }
            :deep(.ant-collapse-content-box) {
                background-color: #f3f3f3;
                padding: 6px;
                min-height: 100px;
            }

            .directory-main {
                :deep(.ant-tree) {
                    background-color: #f3f3f3;
                    .ant-tree-title {
                        word-break: break-all;
                    }
                }
            }
        }

        .search {
            color: #676767;
            padding: 10px 12px;

            .collapse-root {
                :deep(> .ant-collapse-item > .ant-collapse-header) {
                    .ant-collapse-header-text {
                        word-break: break-all;
                    }
                }
                :deep(.ant-collapse-content) {
                    .result-item {
                        padding-bottom: 8px;
                        word-break: break-all;

                        &:not(:first-child) {
                            padding-top: 8px;
                        }

                        &:not(:last-child) {
                            border-bottom: 1px solid #f1f1f1;
                        }

                        .keyword-hl {
                            background-color: #dd8437;
                            color: #fff;
                        }

                        .line-number {
                            padding-left: 8px;
                            color: #ed7f31;
                        }
                    }
                }
            }

            .case-text {
                padding-left: 4px;
                font-size: 14px;

                &.active {
                    color: #268cfc;
                }
            }
        }
    }

    .resize-bar {
        width: 300px;
        height: inherit;
        resize: horizontal;
        cursor: ew-resize;
        cursor: col-resize;
        opacity: 0;
        overflow: scroll;
    }

    /* 拖拽线 */

    .resize-line {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        border-right: 2px solid #eee;
        border-left: 1px solid #bbb;
        pointer-events: none;
    }

    .resize-bar:hover ~ .resize-line,
    .resize-bar:active ~ .resize-line {
        border-left: 1px dashed skyblue;
    }

    .resize-bar::-webkit-scrollbar {
        width: 300px;
        height: inherit;
    }
}
</style>
