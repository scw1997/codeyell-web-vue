import { ref } from 'vue';
import http from '@/utils/http';
import api from '@/api';

//获取热门注解列表
export const useHotNote = () => {
    interface StatesType {
        offset: number; //热门注解列表查询的offset分页参数
        hotNoteData: any[]; //热门注解数据
        isFinish: boolean; //热们注解数据是否加载完毕
        loading: boolean; //热门注解数据加载按钮状态
    }

    const states = ref<StatesType>({
        offset: 0,
        hotNoteData: [],
        isFinish: true,
        loading: false
    });

    //获取热门注解列表
    const getHotNoteData = async (nextPage = false) => {
        //nextPage表示加载下一页数据
        const newOffset = nextPage ? states.value.offset + 10 : 0;
        if (nextPage) {
            states.value.loading = true;
        }
        const newData =
            (await http.post(api.comment.getRecentHotCommentList, { offset: newOffset })) || [];

        states.value = {
            hotNoteData: nextPage ? [...states.value.hotNoteData, ...newData] : newData,
            offset: newOffset,
            isFinish: newData.length < 10,
            loading: nextPage ? false : states.value.loading
        };

        return newData;
    };

    return { hotNoteStatesRef: states, getHotNoteData };
};

//获取最近项目列表
export const useRecentPro = () => {
    const recentProData = ref<any[]>([]); //最新项目数据

    const getRecentProjectData = async () => {
        const data = await http.post(api.project.getRecentProList);
        recentProData.value = data;
        return data;
    };

    return { recentProData, getRecentProjectData };
};

//获取最近项目列表
export const useMyPro = () => {
    const myProData = ref<any[]>([]); //我的项目项目数据

    const getMyProjectData = async () => {
        const { list = [] } = await http.post(api.user.getMyProList, { limit: 5 });

        myProData.value = list || [];
        return list;
    };

    return { myProData, getMyProjectData };
};

//获取热门项目列表
export const useHotPro = () => {
    const hotProData = ref<any[]>([]);

    const getHotProjectData = async ({ rangeValue, languageValue }) => {
        const data = await http.post(api.project.getHotProList, {
            index: rangeValue,
            language: languageValue === -1 ? undefined : languageValue
        });
        hotProData.value = data;

        return data;
    };

    return { hotProData, getHotProjectData };
};
