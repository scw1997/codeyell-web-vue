import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import {Input} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
const app = createApp(App);

app.use(router);

app.use(Input);

app.mount('#root');
