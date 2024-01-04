import { defineStore } from 'pinia';
import { SelectProps } from 'ant-design-vue';
import http from '@/utils/http';
import api from '@/api';

const storageUser = localStorage.getItem('user');

interface StoreStatesType {
    //全局用户信息
    userInfo: Record<string, any> | null;
    //登录token
    token: string | null;
    //支持的语言枚举值
    languageData: Exclude<SelectProps['options'], undefined>;
    //邀请人id
    inviteId: string | null;
    //积分获取/消费规则
    integralRulesData: { increase: any[]; decrease: any[] } | null;
}
const useGlobalStore = defineStore('global', {
    state: (): StoreStatesType => ({
        userInfo: storageUser ? JSON.parse(storageUser) : null,
        token: localStorage.getItem('token'),
        languageData: [],
        inviteId: sessionStorage.getItem('invite_id'),
        integralRulesData: null
    }),
    actions: {
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('token', token);
        },
        setUserInfo(data: StoreStatesType['userInfo']) {
            this.userInfo = data;
            localStorage.setItem('user', JSON.stringify(data));
        },
        //刷新获取我的用户基本信息
        async refreshMyData() {
            const data = await http.post(api.user.getMyData);
            //存储全局且本地缓存
            this.setUserInfo({ ...this.userInfo, ...data });
        },
        setInviteId(id: string) {
            this.inviteId = id;
            sessionStorage.setItem('invite_id', id);
        },
        //重置登陆状态和用户信息
        clearUserCache() {
            this.userInfo = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        //获取支持的语言枚举值
        async getLanguageData() {
            const data = await http.get(api.global.getLanguageData);
            this.languageData = data.map(({ id, name }: { id: number; name: string }) => ({
                label: name,
                value: id
            }));
        },
        //获取积分获取/消费规则
        async getIntegralRules() {
            const data = (await http.get(api.user.getIntegralRules, {})) || {};
            this.integralRulesData = data;
        }
    }
});
export default useGlobalStore;
