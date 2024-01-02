import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import {Input, notification, Spin, App as AntdApp, Button, Form, Select, Upload, Avatar, Tabs} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
const app = createApp(App);

app.use(router);

app.use(Input);
app.use(Spin);
app.use(AntdApp);
app.use(Button);
app.use(Form);
app.use(Select);
app.use(Upload);
app.use(Avatar);
app.use(Tabs);

app.mount('#root');
