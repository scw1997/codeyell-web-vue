import vue, { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import {
    Input,
    ConfigProvider,
    Spin,
    App as AntdApp,
    Button,
    Form,
    Select,
    Upload,
    Avatar,
    Tabs,
    Image,
    Space,
    Row,
    Col,
    Dropdown,
    Card,
    Empty,
    Popover,
    Tag,
    Tooltip
} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './index.less';

import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia());
app.use(router);
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

app.mount('#root');
