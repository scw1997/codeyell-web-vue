import { defineGlobal } from 'swico/vue';
import { createPinia } from 'pinia';
import {
    Avatar,
    Button,
    Card,
    Col,
    ConfigProvider,
    Dropdown,
    Empty,
    Form,
    Image,
    Input,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Tabs,
    Tag,
    Tooltip,
    Upload,
    App
} from 'ant-design-vue';
import { App as AntdApp } from 'ant-design-vue/es/components';
import useReadStore from '@/store/read';
import { toRefs } from 'vue';
import useGlobalStore from '@/store/global';

export default defineGlobal({
    onInit: (app, router) => {
        app.use(createPinia());
        app.use(ConfigProvider)
            .use(Input)
            .use(Spin)
            .use(AntdApp)
            .use(Button)
            .use(Form)
            .use(Select)
            .use(Upload)
            .use(Avatar)
            .use(Tabs)
            .use(Image)
            .use(Space)
            .use(Row)
            .use(Col)
            .use(Dropdown)
            .use(Card)
            .use(Empty)
            .use(Popover)
            .use(Tooltip)
            .use(Tag);

        router.beforeEach((to, from, next) => {
            const { name, path, fullPath } = to;
            const readStore = useReadStore();
            const { token } = toRefs(useGlobalStore());
            if (name === 'project-read') {
                //访问项目阅读页判断跳转来源，若是新开独立页面，则点击阅读页左上角时返回到项目详情页，否则返回上一页
                readStore.setIsPush(!(from.path === '/'));
                next();
            } else if (
                ['my-personal', 'my-settings', 'project-create'].includes(name as string) &&
                !token.value
            ) {
                //部分页面只能登录后访问
                next({
                    name: 'auth-login',
                    query: path === '/' ? {} : { redirect_path: fullPath }
                });
            } else {
                next();
            }
        });
    }
});
