<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { Empty, MenuProps, Tabs, TabPane, Menu } from 'ant-design-vue';
import { copyToClipboard, debounce, EMPTY } from '@/utils/tools';
import Toast from '@/utils/Toast';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import useGlobalStore from '@/store/global';
import useReadStore, { TabItem } from '@/store/read';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'secywo-template-cli';
import { MenuClickEventHandler } from 'ant-design-vue/es/menu/src/interface';

export type Editor = monaco.editor.IStandaloneCodeEditor | null;
interface PropsType {
    openNoteModal: (type: 'create', record?: Record<string, any>) => void; //打开注解弹窗
}
interface StatesType {
    tabMenuOpenIndex: number | null; //当前操作右击菜单的tab的index
    mode: 'empty' | 'editor' | 'image'; //编辑器内容显示模式
}

const globalStore = useGlobalStore();
const readStore = useReadStore();
const {
    setTabList,
    setRightShowMode,
    setCurNoteFileData,
    getFileContent,
    getNoteLineDataByFile,
    getShortPath,
    getFileSuffixTypeByPath,
    getLanguage,
    setCurNoteModalData
} = readStore;
const {
    tabList,
    rightShowMode,
    tabChangeType,
    curNoteModalData,
    rightAutoVisible,
    activeTab,
    isJoined
} = storeToRefs(readStore);
const { token } = storeToRefs(globalStore);
const router = useRouter();
const route = useRoute();
const { file: initActiveFileData, id: projectId } = route.query;
const states = ref<StatesType>({
    tabMenuOpenIndex: null,
    mode: 'empty'
});
const dropdownItems = ref<MenuProps['items']>([]);
const props = defineProps<PropsType>();

//处理tabItem的鼠标右击显示menu后，点击页面其他处隐藏menu
const docListener = () => {
    states.value.tabMenuOpenIndex = null;
};

//未登录/未加入判断跳转相关处理
const handleAuthJump = () => {
    if (token) {
        //已登录
        //未加入并且当前查看的是第二级及其往下的文件，则展示加入阅读的页面，否则可以查看注解（展示children）
        const joinPageVisible = !isJoined && Number(activeTab.value?.name.split('/').length) >= 2;
        setRightShowMode(joinPageVisible ? 'join' : 'note');
    } else {
        //未登录
        //顶层文件默认可查看注解列表。发表/点赞/回复注解等操作需登录。其他情况必须先登录
        const isTopLevelFile = Number(activeTab.value?.name.split('/').length) < 2;

        setRightShowMode(isTopLevelFile ? 'note' : 'login');
    }
};

//处理默认初始需要打开的文件tab参数
const getFileData = async (fileData: { path: string; fileId: string; line?: string }) => {
    const { fileId, line, path } = fileData;
    const shortPath = getShortPath(path);
    const fileType = getFileSuffixTypeByPath(path);

    const language = getLanguage(fileType);
    const [codeContent, noteLineData] = await Promise.allSettled([
        getFileContent(projectId! as string, path, language),
        getNoteLineDataByFile(projectId! as string, path, fileId)
    ]);
    const formatNoteLineData = noteLineData?.status === 'rejected' ? [] : noteLineData.value;

    setTabList([
        {
            name: path,
            shortName: shortPath,
            content: codeContent?.status === 'rejected' ? '' : codeContent.value,
            active: true,
            key: path,
            line: line ? Number(line) : undefined,
            fileId,
            language,
            noteLineData: formatNoteLineData
        }
    ]);

    if (line) {
        //获取所点击行对应的含注解代码行数据
        const matchNoteLineDateList = (formatNoteLineData as any[]).filter(
            ({ start_line, end_line }) => line >= start_line && line <= end_line
        );
        let matchLineData: { startLine: number; endLine: number } | undefined = undefined;
        if (matchNoteLineDateList.length > 0) {
            //有匹配值，则说明对应的是含注解的代码行
            //根据就大原则，获取对应的起始行和终止行数据用于获取对应注解列表
            matchNoteLineDateList.forEach((item) => {
                const { start_line, end_line } = item;
                if (
                    !matchLineData ||
                    start_line > matchLineData.startLine ||
                    (start_line === matchLineData.startLine && end_line < matchLineData.endLine)
                ) {
                    matchLineData = {
                        startLine: start_line,
                        endLine: end_line
                    };
                }
            });
        } else {
            //此行没有注解，
            if (rightAutoVisible.value) {
                //如果设置了自动显示隐藏的话，这种情况就隐藏掉注解
                setRightShowMode('hidden');
            }
            return;
        }
        if ((matchLineData as any) && rightAutoVisible.value) {
            //存储当前选择的含注解代码区域数据，若注解为显示模式，则加载注解
            setCurNoteFileData({
                startLine: matchLineData!.startLine,
                endLine: matchLineData!.endLine,
                fileId,
                filePath: path,
                shortFilePath: shortPath
            });

            handleAuthJump();
        }
    }
};

const createEditor = () => {
    const { line, noteLineData, content, language, key, fileId, shortName, name } =
        activeTab.value!;
    //创建editor实例
    const tempEditor = monaco.editor.create(document.getElementById(`${fileId}-monaco-ref`)!, {
        value: content || '',
        language: language || 'javascript',
        lineNumbers: 'on', //是否显示行号
        scrollBeyondLastLine: false, //控制编辑器是否可以滚动到最后一行之后
        readOnly: true,
        glyphMargin: true,
        automaticLayout: true, //宽高自适应
        scrollbar: {
            useShadows: false,
            verticalHasArrows: true,
            horizontalHasArrows: true,
            vertical: 'auto',
            horizontal: 'auto',
            arrowSize: 30
        }
    });

    //添加发表注解功能
    tempEditor.addAction({
        id: 'add-note',
        label: '发表注解',
        //快捷键
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10],

        contextMenuGroupId: 'navigation',
        contextMenuOrder: 0, //显示位置顺序
        run: function (editor) {
            console.log('getSelection', editor.getSelection());
            const { startLineNumber, endLineNumber, endColumn } = editor.getSelection()!;
            let formatEndLineNumber = endLineNumber;
            //针对个别特殊情况处理（选中的末行的column为1，则忽视该行）
            if (endLineNumber > startLineNumber && endColumn === 1) {
                formatEndLineNumber--;
            }
            //点击事件
            props.openNoteModal('create', {
                start_line: startLineNumber,
                end_line: formatEndLineNumber
            });
        }
    });

    //添加复制链接功能
    tempEditor.addAction({
        id: 'copy-link',
        label: '复制链接',
        //快捷键
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F11],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 0, //显示位置顺序
        run: async (editor) => {
            const { startLineNumber } = editor.getSelection()!;
            const { origin, pathname } = window.location;

            await copyToClipboard(
                `${origin}${pathname}?id=${projectId}&file=${encodeURIComponent(
                    JSON.stringify({
                        path: key,
                        fileId,
                        line: startLineNumber
                    })
                )}`
            );
            Toast.success('复制成功');
        }
    });

    //监听点击事件
    tempEditor.onMouseUp(
        debounce((e: monaco.editor.IEditorMouseEvent) => {
            const selection = tempEditor.getSelection();

            //是否选中了文字
            const hasSelectText =
                selection &&
                (selection.endColumn > selection.startColumn ||
                    selection.endLineNumber > selection.startLineNumber);
            console.log('hasSelectText', hasSelectText);
            const {
                event: { leftButton, rightButton },

                target: { position, type }
            } = e;
            const line = selection?.positionLineNumber;
            //鼠标右键点击则不处理
            if (rightButton) return;
            //type=12表示编辑器的内置查找操作，过滤该情况
            if (leftButton && line && ![12].includes(type)) {
                //点击或选择了某一行代码

                //定义对应起始行和终止行数据
                let matchLineData: { startLine: number; endLine: number } | undefined = undefined;
                //获取所点击行对应的含注解代码行数据
                const matchNoteLineDataList = activeTab.value!.noteLineData.filter(
                    ({ start_line, end_line }) => line >= start_line && line <= end_line
                );
                if (hasSelectText) {
                    //选中（非点击）了代码行（无论是否有注解）
                    matchLineData = {
                        startLine: selection.startLineNumber,
                        endLine:
                            //这里判断下如果当选中内容的末尾光标在当前行的最前方的位置，则不计入该行
                            selection?.endColumn === 1
                                ? selection.endLineNumber - 1
                                : selection.endLineNumber
                    };
                } else if (matchNoteLineDataList.length > 0) {
                    //有匹配值，则说明为含注解的代码行
                    //根据就大原则，获取对应的起始行和终止行数据用于获取对应注解列表
                    matchNoteLineDataList.forEach((item) => {
                        const { start_line, end_line } = item;
                        if (
                            !matchLineData ||
                            start_line > matchLineData.startLine ||
                            (start_line === matchLineData.startLine &&
                                end_line < matchLineData.endLine)
                        ) {
                            matchLineData = {
                                startLine: start_line,
                                endLine: end_line
                            };
                        }
                    });
                }

                if (matchLineData as any) {
                    //若有对应起始行和终止行数据，且为自动模式，则显示右侧注解
                    if (rightAutoVisible.value) {
                        //同步更新可能正在打开的注解编辑弹窗数据
                        setCurNoteModalData({
                            ...(curNoteModalData.value || {}),
                            mode: 'create',
                            record: {
                                start_line: matchLineData!.startLine,
                                end_line: matchLineData!.endLine
                            }
                        });
                        handleAuthJump();
                    }

                    setCurNoteFileData({
                        startLine: matchLineData!.startLine,
                        endLine: matchLineData!.endLine,
                        fileId,
                        filePath: name,
                        shortFilePath: shortName
                    });
                } else {
                    //无对应起始行和终止行数据即只是纯点击了空闲代码行
                    if (rightAutoVisible.value) {
                        //如果设置了自动模式，这种情况就隐藏掉注解
                        setRightShowMode('hidden');
                    }
                }
            } else {
                //点击了非代码行区域
                if (rightAutoVisible.value && ![12].includes(type)) {
                    //自动模式下，不是内置查找操作上的点击，此时点击则隐藏右侧
                    setRightShowMode('hidden');
                }
            }
        })
    );
    let currentDecorationConfig; //定义当前文件的带下划线（表示含注解）的代码行样式的配置信息

    const model = monaco.editor.createModel(content, language);
    //更新为当前active tab的代码内容，语言等配置，
    tempEditor.setModel(model);
    //如果含有注解数据，将指定注解行进行下划线高亮

    currentDecorationConfig = tempEditor.createDecorationsCollection([
        ...(noteLineData || [])
            .map(({ start_line, end_line, color }) => {
                const decorationList: any[] = [];
                for (let curLine = start_line; curLine <= end_line; curLine++) {
                    const starCol = model.getLineFirstNonWhitespaceColumn(curLine);
                    const endCol = model.getLineLastNonWhitespaceColumn(curLine);
                    decorationList.push({
                        range: new monaco.Range(curLine, starCol, curLine, endCol),
                        options: {
                            isWholeLine: false,
                            inlineClassName: `note-line-${color}`
                            // //对含有注解的代码行进行行号右侧进行装饰高亮
                            // linesDecorationsClassName: 'note-decoration-line-style'
                        }
                    });
                }
                return decorationList;
            })
            .flat()
    ]);

    if (line) {
        //跳转到指定行
        tempEditor.setScrollTop(getScrollHeight(line, tempEditor));
        tempEditor.setPosition({ lineNumber: line, column: 1 });
        //添加侧边行高亮标记
        // currentDecorationConfig.set([
        //     {
        //         range: new monaco.Range(line, 0, line, 1),
        //         options: {
        //             glyphMarginClassName: 'jump-line-margin-style'
        //         }
        //     }
        // ]);
    }

    const newTabList = tabList.value.slice();
    const activeTabIndex = newTabList.findIndex((item) => item.key === activeTab.value?.key);
    if (activeTabIndex !== -1) {
        newTabList[activeTabIndex] = {
            ...activeTab.value!,
            editor: tempEditor,
            decorations: currentDecorationConfig
        };
    }

    setTabList(newTabList, true);
};

//获取从顶部滚动到使指定行显示在编辑器中间所需要的垂直距离
const getScrollHeight = (targetLineNum: number, editor: TabItem['editor']) => {
    const containerHeight = editor!.getContainerDomNode().clientHeight;
    const positionHeight = editor!.getTopForPosition(targetLineNum, 0) + 0.5 * containerHeight;
    const distance = positionHeight - containerHeight;
    return distance < 0 ? 0 : distance;
};

//处理editor模式下的编辑器渲染逻辑
watch(
    [() => states.value.mode, tabChangeType, tabList],
    ([newMode, newTabChangeType, newTabList]) => {
        if (newMode === 'editor' && newTabList.length > 0) {
            const activeTab = newTabList?.find((item) => item.active);
            if (newTabChangeType === 'increase') {
                //只有tab增加时即打开新tab时才重新初始化编辑器渲染
                createEditor();
            } else if (newTabChangeType === 'update') {
                //更新tab，不增删tab
                const { line, editor, noteLineData, content, language, decorations, fileId } =
                    activeTab!;
                //可能文件注解数据有更新（例如右侧发表了新注解或删除了注解）

                const model = monaco.editor.createModel(content, language);
                document.getElementById(`${fileId}-monaco-ref`).innerHTML = '';
                const tempEditor = monaco.editor.create(
                    document.getElementById(`${fileId}-monaco-ref`)!,
                    {
                        value: content || '',
                        language: language || 'javascript',
                        lineNumbers: 'on', //是否显示行号
                        scrollBeyondLastLine: false, //控制编辑器是否可以滚动到最后一行之后
                        readOnly: true,
                        glyphMargin: true,
                        automaticLayout: true, //宽高自适应
                        scrollbar: {
                            useShadows: false,
                            verticalHasArrows: true,
                            horizontalHasArrows: true,
                            vertical: 'auto',
                            horizontal: 'auto',
                            arrowSize: 30
                        }
                    }
                );
                const newDecorationsData = [
                    ...(noteLineData || [])
                        .map(({ start_line, end_line, color }) => {
                            const decorationList: any[] = [];
                            for (let curLine = start_line; curLine <= end_line; curLine++) {
                                const starCol = model.getLineFirstNonWhitespaceColumn(curLine);
                                const endCol = model.getLineLastNonWhitespaceColumn(curLine);
                                decorationList.push({
                                    range: new monaco.Range(curLine, starCol, curLine, endCol),
                                    options: {
                                        isWholeLine: false,
                                        inlineClassName: `note-line-${color}`
                                        // //对含有注解的代码行进行行号右侧进行装饰高亮
                                        // linesDecorationsClassName: 'note-decoration-line-style'
                                    }
                                });
                            }
                            return decorationList;
                        })
                        .flat()
                ] as any;

                // //如果含有注解数据，更新代码行下划线高亮的数据

                tempEditor.createDecorationsCollection(newDecorationsData);
                //
                // if (line) {
                //     //跳转到指定行
                //     editor?.setScrollTop(getScrollHeight(line, editor));
                //     editor?.setPosition({ lineNumber: line, column: 1 });
                //     //添加侧边行高亮标记
                //     // decorations.set([
                //     //     {
                //     //         range: new monaco.Range(line, 0, line, 1),
                //     //         options: {
                //     //             glyphMarginClassName: 'jump-line-margin-style'
                //     //         }
                //     //     }
                //     // ]);
                // }
            }
        }
    },
    { flush: 'post' }
);

//控制mode的切换
watch(tabList, (newTabList) => {
    //获取当前active tab的数据
    if (newTabList.length > 0) {
        const { language } = activeTab.value as TabItem;
        if (language === 'img') {
            //打开图片文件
            states.value.mode = 'image';
        } else {
            if (states.value.mode !== 'editor') {
                states.value.mode = 'editor';
            }
        }
    } else {
        states.value.mode = 'empty';
    }
});

//tab item鼠标右击事件
const handleTabMouseRightClick = (index: number, e) => {
    states.value.tabMenuOpenIndex = index;
};
//tab的active 切换
const handleTabActiveChange = (index: number) => {
    //先重置active状态
    const newTabList = tabList.value.map((item) => ({ ...item, active: false, line: undefined }));
    newTabList[index].active = true;
    setTabList(newTabList, true);
};

const closeTabItem = (tabIndex: number, e?) => {
    const newTabList = tabList.value.slice();
    newTabList.splice(tabIndex, 1);

    if (newTabList.length == 0) {
        //如果关闭的是最后一个
        setTabList([]);
        states.value.tabMenuOpenIndex = null;
        return;
    } else if (tabIndex === tabList.value.findIndex((item) => item.active)) {
        //如果关闭的是当前的active tab，则使左侧tab active

        newTabList[tabIndex - 1 < 0 ? 0 : tabIndex - 1].active = true;
    }
    setTabList(newTabList);
    states.value.tabMenuOpenIndex = null;
};

const handleMenuItemClick: MenuClickEventHandler = async ({ item, keyPath, key }) => {
    const tabMenuOpenIndex = states.value.tabMenuOpenIndex;
    const newTabList = tabList.value.slice();
    let filterTabList;
    switch (key) {
        case '1': //关闭
            closeTabItem(tabMenuOpenIndex);
            break;
        case '2': //关闭其他
            newTabList[tabMenuOpenIndex].active = true;
            setTabList(
                newTabList.filter((item: TabItem, index: number) => index === tabMenuOpenIndex)
            );
            states.value.tabMenuOpenIndex = null;
            break;
        case '3': //关闭左侧
            filterTabList = newTabList.filter(
                (item: TabItem, index: number) => index >= tabMenuOpenIndex
            );
            if (!filterTabList.find((item: TabItem) => item.active)) {
                //关闭左侧后的tabList不存在active tab，则使第一个tab active
                filterTabList[0].active = true;
            }
            setTabList(filterTabList);
            states.value.tabMenuOpenIndex = null;

            break;

        case '4': //关闭右侧
            filterTabList = newTabList.filter(
                (item: TabItem, index: number) => index <= tabMenuOpenIndex
            );
            if (!filterTabList.find((item: TabItem) => item.active)) {
                //关闭右侧后的tabList不存在active tab，则使最后一个tab active
                filterTabList[filterTabList.length - 1].active = true;
            }
            setTabList(filterTabList);
            states.value.tabMenuOpenIndex = null;
            break;
        case '5': //关闭全部
            setTabList([]);
            states.value.tabMenuOpenIndex = null;
            break;
        case '6': //复制链接
            // eslint-disable-next-line no-case-declarations
            const { origin, pathname } = window.location;
            // eslint-disable-next-line no-case-declarations
            const { language, key, fileId, shortName, name } = activeTab.value!;
            await copyToClipboard(
                `${origin}${pathname}?id=${projectId}&file=${encodeURIComponent(
                    JSON.stringify({
                        path: key,
                        fileId
                    })
                )}`
            );
            Toast.success('复制成功');
            states.value.tabMenuOpenIndex = null;
    }
};

watch(
    () => states.value.tabMenuOpenIndex,
    (newOpenIndex) => {
        if (newOpenIndex !== null) {
            const defaultItems = [
                {
                    label: '关闭',
                    key: '1',
                    visible: true
                },
                {
                    label: '关闭其它',
                    key: '2',
                    visible: tabList.value.length > 1
                },
                {
                    label: '关闭左侧',
                    key: '3',
                    visible: newOpenIndex > 0
                },
                {
                    label: '关闭右侧',
                    key: '4',
                    visible: newOpenIndex !== tabList.value.length - 1
                },
                {
                    label: '关闭全部',
                    key: '5',
                    visible: true
                },
                {
                    label: '复制链接',
                    key: '6',
                    visible: true
                }
            ];
            dropdownItems.value = defaultItems.filter((item) => item.visible);
        } else {
            dropdownItems.value = [];
        }
    }
);

onMounted(() => {
    //存在默认打开的文件tab参数
    if (initActiveFileData && !activeTab) {
        getFileData(JSON.parse(decodeURIComponent(initActiveFileData as string)));
    }

    document.addEventListener('click', docListener);
});

onUnmounted(() => {
    activeTab.value?.editor?.dispose();
    document.removeEventListener('click', docListener);
    //这里离开页面重置下该属性，便于再返回此页面时重新渲染编辑器
    readStore.tabChangeType = 'increase';
});
</script>

<template>
    <div
        :class="{
            'project-read-middle-section-root': true,
            'no-resize': rightShowMode === 'hidden'
        }"
    >
        <div class="resize-bar"></div>
        <div class="resize-line"></div>
        <div class="resize-save">
            <Tabs
                :activeKey="activeTab?.key"
                class="middle-tabs-root"
                defaultActiveKey="1"
                :destroyInactiveTabPane="false"
                :tabBarGutter="2"
                tabPosition="top"
            >
                <template #rightExtra>
                    <div
                        @click="
                            () => {
                                if (rightShowMode !== 'hidden') {
                                    setRightShowMode('hidden');
                                } else {
                                    handleAuthJump();
                                }
                            }
                        "
                    >
                        <RightOutlined
                            v-if="rightShowMode !== 'hidden'"
                            class="cp"
                            style="font-size: 20px"
                        />

                        <LeftOutlined v-else class="cp" style="font-size: 20px" />
                    </div>
                </template>
                <TabPane :key="key" v-for="({ name, shortName, key, fileId }, index) in tabList">
                    <template #tab>
                        <ADropdown
                            :key="index"
                            :open="states.tabMenuOpenIndex === index"
                            :trigger="['contextMenu']"
                        >
                            <template #overlay>
                                <Menu :items="dropdownItems" @click="handleMenuItemClick"></Menu>
                            </template>

                            <div
                                @click="handleTabActiveChange(index)"
                                @contextmenu.prevent="handleTabMouseRightClick(index, $event)"
                            >
                                <ATooltip class="tab-name" :title="name">
                                    {{ shortName }}
                                </ATooltip>
                                <CloseOutlined
                                    @click.stop="closeTabItem(index)"
                                    :size="10"
                                    style="font-size: 12px; padding-left: 4px"
                                />
                            </div>
                        </ADropdown>
                    </template>

                    <section class="main-content">
                        <div
                            v-if="states.mode === 'editor'"
                            class="editor-container"
                            :id="`${fileId}-monaco-ref`"
                        ></div>

                        <div v-else class="no-editor-content-container">
                            <img
                                :alt="activeTab.shortName"
                                :src="activeTab.content"
                                v-if="states.mode === 'image'"
                            />
                            <Empty
                                v-else-if="states.mode === 'empty'"
                                description="请打开一个项目文件"
                                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                            />
                        </div>
                    </section>
                </TabPane>
            </Tabs>
        </div>
    </div>
</template>

<style scoped lang="less">
.project-read-middle-section-root {
    //overflow: auto;
    position: relative;
    height: calc(100vh - var(--readPageHeaderHeigt));
    flex: none;

    &.no-resize {
        flex: 1;

        .resize-bar,
        .resize-line {
            display: none;
        }

        .resize-save {
            position: static;
            overflow-x: initial;
            height: 100%;
        }
    }

    .resize-save {
        position: absolute;
        top: 0;
        right: 5px;
        bottom: 0;
        left: 0;
        overflow-x: hidden;

        .middle-tabs-root {
            :deep(.ant-tabs-nav) {
                height: 36px;
                background-color: #f2f2f2;
                padding-right: 10px;

                .ant-tabs-tab {
                    padding-left: 8px;
                }
            }

            .main-content {
                height: calc(100vh - var(--readPageHeaderHeigt) - 52px);
                overflow: auto;
                padding-right: 12px;

                :deep(.editor-container) {
                    height: 100%;

                    .jump-line-margin-style {
                        background-color: #ff9900;
                    }

                    .note-decoration-line-style {
                        background: #2c93dd;
                        margin: 0px 0 4px 3px;
                    }

                    [class*='note-line-'] {
                        text-decoration: underline 2px;
                    }

                    .note-line-000000 {
                        text-decoration-color: #000000;
                    }

                    .note-line-E60012 {
                        text-decoration-color: #e60012;
                    }

                    .note-line-EB6100 {
                        text-decoration-color: #eb6100;
                    }

                    .note-line-F39800 {
                        text-decoration-color: #f39800;
                    }

                    .note-line-FCC800 {
                        text-decoration-color: #fcc800;
                    }

                    .note-line-FFF100 {
                        text-decoration-color: #fff100;
                    }

                    .note-line-CFDB00 {
                        text-decoration-color: #cfdb00;
                    }

                    .note-line-8FC31F {
                        text-decoration-color: #8fc31f;
                    }

                    .note-line-22AC38 {
                        text-decoration-color: #22ac38;
                    }

                    .note-line-009944 {
                        text-decoration-color: #009944;
                    }

                    .note-line-009B6B {
                        text-decoration-color: #009b6b;
                    }

                    .note-line-009E96 {
                        text-decoration-color: #009e96;
                    }

                    .note-line-00A0C1 {
                        text-decoration-color: #00a0c1;
                    }

                    .note-line-00A0E9 {
                        text-decoration-color: #00a0e9;
                    }

                    .note-line-0086D1 {
                        text-decoration-color: #0086d1;
                    }

                    .note-line-0068B7 {
                        text-decoration-color: #0068b7;
                    }

                    .note-line-00479D {
                        text-decoration-color: #00479d;
                    }

                    .note-line-1D2088 {
                        text-decoration-color: #1d2088;
                    }

                    .note-line-601986 {
                        text-decoration-color: #601986;
                    }

                    .note-line-920783 {
                        text-decoration-color: #920783;
                    }

                    .note-line-BE0081 {
                        text-decoration-color: #be0081;
                    }

                    .note-line-E4007F {
                        text-decoration-color: #e4007f;
                    }

                    .note-line-E5006A {
                        text-decoration-color: #e5006a;
                    }

                    .note-line-E60033 {
                        text-decoration-color: #e60033;
                    }
                }

                .no-editor-content-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    padding: 20px;

                    & > img {
                        max-height: 100%;
                        max-width: 100%;
                        object-position: center;
                        object-fit: contain;
                    }
                }
            }
        }
    }

    .resize-bar {
        width: 40vw;
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
        width: 40vw;
        height: inherit;
    }

    ///* Firefox只有下面一小块区域可以拉伸 */
    //@supports (-moz-user-select: none) {
    //    .resize-bar:hover ~ .resize-line,
    //    .resize-bar:active ~ .resize-line {
    //        border-left: 1px solid #bbb;
    //    }
    //
    //    .resize-bar:hover ~ .resize-line::after,
    //    .resize-bar:active ~ .resize-line::after {
    //        content: '';
    //        position: absolute;
    //        width: 16px;
    //        height: 16px;
    //        bottom: 0;
    //        right: -8px;
    //        //background: url(./resize.svg);
    //        background-size: 100% 100%;
    //    }
    //}
    .myInlineDecoration {
        color: red !important;
        cursor: pointer;
        text-decoration: underline;
        font-weight: bold;
        font-style: oblique;
    }
}
</style>
