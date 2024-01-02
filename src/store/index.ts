import { defineStore } from 'pinia';
import { SelectProps } from 'ant-design-vue';

const storageUser = localStorage.getItem('user');

interface StoreStatesType {
    userInfo: Record<string, any> | null;
    token: string | null;
    languageData: Exclude<SelectProps['options'], undefined>;
    inviteId: string | null;
}
const store = defineStore('global', {
    state: (): StoreStatesType => ({
        userInfo: storageUser ? JSON.parse(storageUser) : null,
        token: localStorage.getItem('token'),
        languageData: [],
        inviteId: sessionStorage.getItem('invite_id')
    }),
    actions: {
        updateshowGrid(showGrid: boolean): void {
            this.showGrid = showGrid;
        }
    }
});
export default store;
