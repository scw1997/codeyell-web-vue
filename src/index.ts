import { createApp } from 'vue';
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
    Dropdown
} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './index.less';
const app = createApp(App);
import { createPinia } from 'pinia';

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
    .use(Dropdown);

app.mount('#root');
