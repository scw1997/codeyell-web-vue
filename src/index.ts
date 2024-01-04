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
    Tabs
} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
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
    .use(Tabs);

app.mount('#root');
