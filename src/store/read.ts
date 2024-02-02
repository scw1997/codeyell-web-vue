import { defineStore } from 'pinia';
import useGlobalStore from './global';
import http from '@/utils/http';
import api from '@/api';
import monaco from 'monaco-editor';
import { getContentFromBase64 } from '@/utils/tools';
import { TreeDataNode } from 'ant-design-vue/es/vc-tree-select/interface';
import { languageRules } from '@/views/project/read/config';

export type Editor = monaco.editor.IStandaloneCodeEditor | null;
export interface TabItem {
    key: string; //唯一标识
    name: string; //完整文件路径
    shortName: string; //简短文件名
    language?: string;
    active: boolean; //是否为当前打开查看状态
    content: string; //代码内容
    line?: number; //搜索模式下的目标关键字所在行
    fileId: string; //文件id
    noteLineData: any[]; //当前文件的注解列表数据
    editor?: Editor;
    decorations?: monaco.editor.IEditorDecorationsCollection;
}

interface CurNoteFileData {
    fileId: string;
    filePath: string;
    startLine: number;
    endLine: number;
    shortFilePath: string;
    createMode?: 'create' | 'createInNotes';
}

export interface CurNoteModalData {
    visible?: boolean; //发表注解弹窗的显隐
    mode?: 'create' | 'createInNotes' | 'reply' | 'edit' | 'childReply'; //弹窗评论模式,中间区域右击发表注解| 右边区域点击发表注解 | 回复一级评论 | 修改一（二）级评论 | 回复二级评论
    record?: Record<string, any>; //当前评论数据的详情
    content?: string; //发表注解弹窗的内容
}

interface StoreStatesType {
    //tab选项卡数据
    tabList: TabItem[];
    //每次tabList变化时的类型，增加/删除/内部更新
    tabChangeType: 'increase' | 'decrease' | 'update' | 'keep';
    //阅读页的右侧部分的显示模式
    rightShowMode: 'sign' | 'login' | 'retrieve' | 'join' | 'note' | 'hidden';
    //阅读页的右侧部分是否自动显示
    rightAutoVisible: boolean;
    //当前的编辑注解的弹窗数据，包括弹窗显隐
    curNoteModalData: CurNoteModalData | null;
    //当前的右侧注解列表的分页器引用
    noteListPageRef: { getData: (pageNo: number) => Promise<any[]>; pageNo: number } | null;
    //当前显示的注解列表相关的代码文件信息
    curNoteFileData: CurNoteFileData | null;
    //是否已加入当前项目
    isJoined: boolean;
    //当前项目的详情信息
    curDetailData: Record<string, any> | null;
    isPush: boolean; // 阅读页的跳转来源
}
const useReadStore = defineStore('read', {
    state: (): StoreStatesType => ({
        tabList: [],
        tabChangeType: 'increase',
        rightShowMode: 'hidden',
        rightAutoVisible: true,
        curNoteModalData: null,
        noteListPageRef: null,
        curNoteFileData: null,
        isJoined: false,
        curDetailData: null,
        isPush: false
    }),
    actions: {
        //重置数据
        clearStoreData() {
            this.tabList = [];
            this.tabChangeType = 'increase';
            this.rightShowMode = 'hidden';
            this.rightAutoVisible = true;
            this.curNoteFileData = null;
            this.isJoined = false;
            this.curDetailData = null;
        },
        setIsPush(isPush) {
            this.isPush = isPush;
        },
        setTabList(tabList: TabItem[], isKeep = false) {
            const newLength = tabList.length;
            const oldLength = this.tabList.length;
            let changeType: typeof this.tabChangeType;
            switch (true) {
                case newLength > oldLength:
                    changeType = 'increase';
                    break;
                case newLength < oldLength:
                    changeType = 'decrease';
                    break;
                default:
                    changeType = 'update';
                    break;
            }

            this.tabChangeType = isKeep ? 'keep' : changeType;

            this.tabList = tabList;
        },
        setRightShowMode(mode: typeof this.rightShowMode) {
            this.rightShowMode = mode;
        },
        setRightAutoVisible(visible: boolean) {
            this.rightAutoVisible = visible;
        },
        setCurNoteModalData(data: typeof this.curNoteModalData) {
            this.curNoteModalData = data;
        },
        setNoteListPageRef(ref: typeof this.noteListPageRef) {
            this.noteListPageRef = ref;
        },
        setCurNoteFileData(data: typeof this.curNoteFileData) {
            this.curNoteFileData = data;
        },
        setCurDetailData(data: typeof this.curDetailData) {
            this.curDetailData = data;
        },
        //查询是否当前用户已加入该阅读
        async getJoinOrNot(projectId: string) {
            const globalStore = useGlobalStore();
            const data = await http.post(api.project.getJoinOrNot, {
                project_id: projectId
            });

            const { count_point, is_added } = data;
            this.isJoined = is_added;
            globalStore.userInfo!.count_point = count_point;
            return is_added;
        },
        //获取指定文件内容
        async getFileContent(projectId: string, path: string, language: TreeDataNode['language']) {
            const data = await http.post(api.code.getCodeContent, {
                project_id: projectId, //项目id
                path
            });
            const base64Data = data?.content;

            //图片文件转成blob url
            return await getContentFromBase64(base64Data, language === 'img' ? 'blobUrl' : 'text');
        },

        //获取指定文件的含注解的代码行数据列表
        async getNoteLineDataByFile(projectId: string, path: string, fileId: string) {
            const res = await http.post(
                api.code.getNoteLineDataByFile,
                {
                    project_id: projectId, //项目id
                    file_id: fileId, //对应文件id，
                    path
                },
                { isControl: true }
            );
            const { code, data, msg } = res;
            switch (code) {
                case 1603:
                    throw msg;
                case 200:
                    return data;
                default:
                    return msg;
            }
        },
        //文件路径简易化
        getShortPath(path: string) {
            const dirItemList = path.split('/');
            const length = dirItemList.length;
            if (length > 1) {
                return `${dirItemList[length - 2]}/${dirItemList[length - 1]}`;
            } else {
                return path;
            }
        },

        //获取文件后缀类型
        getFileSuffixTypeByPath(path: string) {
            return path.slice(path.lastIndexOf('.') + 1).toLowerCase();
        },
        //处理language
        getLanguage(suffixType: string) {
            //如果是图片类型，统一设置为img
            if (['jpg', 'png', 'webp', 'gif', 'jpeg'].includes(suffixType)) {
                return 'img';
            }
            return languageRules[suffixType] || suffixType;
        }
    },
    getters: {
        activeTab: (state) => state.tabList?.find((item) => item.active)
    }
});
export default useReadStore;
