import { DataNode } from 'ant-design-vue/es/tree';
import { ref } from 'vue';
import { debounce } from '@/utils/tools';
import Toast from '@/utils/Toast';
import http from '@/utils/http';
import api from '@/api';

export const useSearch = (projectId: string) => {
    interface StatesType {
        //是否开启大小写匹配
        isCase: boolean;
        //搜索数据
        resultsNum: number;
        filesNum: number;
        data: any[];
        keywords: string;
    }

    const states = ref<StatesType>({
        resultsNum: 0,
        filesNum: 0,
        data: [],
        isCase: false,
        keywords: ''
    });

    const setSearchStates = (mergeStates) => {
        states.value = {
            ...states.value,
            ...mergeStates
        };
    };

    const handleSearch = debounce(async (keywords: string) => {
        if (!keywords) {
            return Toast.info('请输入搜索关键字');
        }
        Toast.loading(true);
        const data = await http.post(api.code.searchCode, {
            project_id: projectId, //项目id
            need_lineno: true, //是否要返回行号，true要行号，flase不要
            case_insensitive: states.value.isCase, //是否大小写敏感，true不敏感，false敏感
            keyword: keywords //搜索关键词
        });
        Toast.loading(false);
        states.value = {
            ...states.value,
            filesNum: data?.length || 0,
            resultsNum: data?.map((item: any) => item.Rows || []).flat().length,
            data,
            keywords
        };
    }, 200);

    return { search: handleSearch, searchStates: states, setSearchStates };
};
