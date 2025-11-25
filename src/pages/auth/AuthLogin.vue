<script setup lang="ts">
import { Title } from '@/components';
import { Form, FormInstance, FormItem, InputPassword } from 'ant-design-vue';
import { ref, toRefs } from 'vue';
import { debounce, Reg } from '@/utils/tools';
import Toast from '@/utils/Toast';
import api from '@/api';
import http from '@/utils/http';
import useGlobalStore from '@/store/global';
import { useLocation, useNav } from 'swico/vue';
import { history } from 'swico/vue';
const nav = useNav();
const globalStore = useGlobalStore();
const route = useLocation();
const { query } = toRefs(route);
const redirect_path = query.value['redirect_path'] || '/';
const props = withDefaults(defineProps<{ isControl?: boolean }>(), { isControl: false });
const formRef = ref<FormInstance>();

const modelStates = ref<{ username: string; password: string }>({ username: '', password: '' });

const emits = defineEmits<{
    success: [];
    signClick: [];
    retrieveClick: [];
}>();

const handleFormFinish = debounce(async (values: Record<string, any>) => {
    Toast.loading(true);
    const data = await http.post(api.auth.login, values);
    const { token, user } = data;
    Toast.success('登录成功');
    globalStore.setUserInfo(user);
    globalStore.setToken(token);
    if (props.isControl) {
        emits('success');
    } else {
        nav(redirect_path as string);
    }
}, 200);
</script>

<template>
    <div class="login-content">
        <Title v-if="!isControl" value="登录 - 源码阅读交流平台" />
        <Form
            ref="formRef"
            :model="modelStates"
            auto-complete="off"
            class="login-form"
            :label-col="{ span: 6 }"
            name="basic"
            :wrapper-col="{ span: 18 }"
            @finish="handleFormFinish"
        >
            <FormItem
                label="手机号"
                name="username"
                :rules="[
                    { required: true, message: '请输入手机号' },
                    { pattern: Reg.mobileTel, message: '手机号格式不正确' }
                ]"
            >
                <AInput
                    v-model:value="modelStates.username"
                    :max-length="11"
                    placeholder="手机号"
                />
            </FormItem>

            <FormItem
                label="密码"
                name="password"
                :rules="[{ required: true, message: '请输入密码' }]"
            >
                <InputPassword
                    v-model:value="modelStates.password"
                    :max-length="20"
                    placeholder="密码"
                />
            </FormItem>

            <FormItem style="text-align: center" :wrapper-col="{ span: 24 }">
                <AButton html-type="submit" style="width: 200px" type="primary">
登录
</AButton>
            </FormItem>
        </Form>

        <ASpace size="large">
            <span
                class="cp"
                @click="
                    () => {
                        isControl ? emits('retrieveClick') : nav({ name: 'auth-retrieve' });
                    }
                "
            >
                找回密码
            </span>
            <span
                class="cp"
                @click="
                    () => {
                        isControl ? emits('signClick') : nav({ name: 'auth-sign' });
                    }
                "
            >
                注册
            </span>
        </ASpace>
    </div>
</template>

<style scoped lang="less">
.login-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .login-form {
        width: 100%;
    }
}
</style>
