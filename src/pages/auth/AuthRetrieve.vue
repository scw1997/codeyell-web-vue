<script setup lang="ts">
import { Title } from '@/components';
import { Form, FormInstance, FormItem, InputPassword } from 'ant-design-vue';
import { onMounted, reactive, ref, toRefs } from 'vue';
import { debounce, Reg } from '@/utils/tools';
import Toast from '@/utils/Toast';
import api from '@/api';
import http from '@/utils/http';
import useGlobalStore from '@/store/global';
import { useLocation, useNav } from 'swico';
import { storeToRefs } from 'pinia';
import { CountDown } from '@/components';
import { history } from 'swico';
const globalStore = useGlobalStore();

const route = useLocation();
const nav = useNav();
const props = withDefaults(defineProps<{ isControl?: boolean }>(), { isControl: false });
const formRef = ref<FormInstance>();
const submitLoading = ref<boolean>(false);

const modelStates = ref<{ username: string; password: string }>({
    username: '',
    password: ''
});

const emits = defineEmits<{
    success: [];
    loginClick: [];
    signClick: [];
}>();

//点击发送短信
const handleSendMsgClick = async () => {
    const { username: mobile } = formRef.value.getFieldsValue();
    if (!Reg.mobileTel.test(mobile)) {
        Toast.info('请输入正确的手机号');
        return false;
    }
    Toast.loading(true);
    await http.post(api.auth.sendCode, { mobile });
    Toast.loading(false);
    return true;
};
//点击确定
const handleSubmit = async (values: Record<string, any>) => {
    try {
        submitLoading.value = true;
        await http.post(api.auth.retrievePwd, values);
        Toast.success('设置新密码成功');
        if (props.isControl) {
            emits('success');
        } else {
            nav({ name: 'auth-login' });
        }
    } finally {
        submitLoading.value = false;
    }
};
</script>
<template>
    <div class="retrieve-content">
        <Title value="找回密码 - 源码阅读交流平台" />
        <Form
            :model="modelStates"
            autoComplete="off"
            class="retrieve-form"
            ref="formRef"
            :labelCol="{ span: 6 }"
            name="basic"
            :onFinish="handleSubmit"
            :wrapperCol="{ span: 18 }"
        >
            <FormItem
                label="手机号"
                name="username"
                :rules="[
                    { required: true, message: '请输入手机号' },
                    {
                        pattern: Reg.mobileTel,
                        message: '手机号格式不正确'
                    }
                ]"
            >
                <AInput v-model:value="modelStates.username" :maxLength="11" placeholder="手机号" />
            </FormItem>

            <FormItem
                label="短信验证码"
                name="code"
                :rules="[{ required: true, message: '请输入验证码' }]"
            >
                <ARow :gutter="8">
                    <ACol :span="16">
                        <FormItem :noStyle="true">
                            <AInput :maxLength="6" placeholder="验证码" />
                        </FormItem>
                    </ACol>
                    <ACol :span="8">
                        <CountDown :beforeStart="handleSendMsgClick" text="发送短信" />
                    </ACol>
                </ARow>
            </FormItem>

            <FormItem
                label="新密码"
                name="password"
                :rules="[{ required: true, message: '请输入新密码' }]"
            >
                <InputPassword
                    v-model:value="modelStates.password"
                    :maxLength="20"
                    placeholder="设置新密码"
                />
            </FormItem>

            <FormItem style="text-align: center" :wrapperCol="{ span: 24 }">
                <AButton
                    htmlType="submit"
                    :loading="submitLoading"
                    style="width: 200px"
                    type="primary"
                >
                    确定
                </AButton>
            </FormItem>
        </Form>

        <ASpace size="large" justify="center">
            <span
                class="cp"
                @click="
                    () => {
                        isControl ? emits('loginClick') : nav({ name: 'auth-login' });
                    }
                "
            >
                登录
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
.retrieve-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .retrieve-form {
        width: 100%;
    }
}
</style>
