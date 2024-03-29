import { defineGlobal } from 'secywo-template-cli';
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

export default defineGlobal({
    initApp: (app) => {
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
    }
});
