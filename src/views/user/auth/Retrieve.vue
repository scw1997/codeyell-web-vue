<script setup lang="ts">
import { Title } from '@/components';
import { Form, FormInstance, FormItem, InputPassword } from 'ant-design-vue';
import { onMounted, reactive, ref, toRefs } from 'vue';
import { debounce, Reg } from '@/utils/tools';
import Toast from '@/utils/Toast';
import api from '@/api';
import http from '@/utils/http';
import useGlobalStore from '@/store/global';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { CountDown } from '@/components';

const globalStore = useGlobalStore();

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const submitLoading = ref<boolean>(false);

const formStatesRef = reactive<{ mobile: string; code: string; password: string }>({
    mobile: '',
    code: '',
    password: ''
});

const emits = defineEmits<{
    success: [callback: () => void];
    login: [];
    retrieveClick: [];
}>();

//点击发送短信
const handleSendMsgClick = async () => {
    const { mobile } = formRef.value.getFieldsValue();
    if (!Reg.mobileTel.test(mobile)) {
        return Toast.info('请输入正确的手机号');
    }
    Toast.loading(true);
    await http.post(api.auth.sendCode, { mobile });
    Toast.loading(false);
    return true;
};
//点击确定
const handleSubmit = async (values: Record<string, any>) => {
    try {
        setStates({ submitLoading: true });
        await http.post(api.auth.retrievePwd, values);
        Toast.success('设置新密码成功');
        if (onSuccess) {
            onSuccess();
        } else {
            history.push('/auth/login');
        }
    } finally {
        setStates({ submitLoading: false });
    }
};
</script>
<template>
    <div class="retrieve-content">
        <Title value="找回密码 - 源码阅读交流平台" />
        <Form
            autoComplete="off"
            class="retrieve-form"
            :form="formRef"
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
                <Input :maxLength="11" placeholder="手机号" />
            </FormItem>

            <FormItem
                label="短信验证码"
                name="code"
                :rules="[{ required: true, message: '请输入验证码' }]"
            >
                <ARow :gutter="8">
                    <ACol :span="16">
                        <FormItem :noStyle="true">
                            <Input :maxLength="6" placeholder="验证码" />
                        </FormItem>
                    </ACol>
                    <ACol :span="8">
                        <CountDown @btnClick="handleSendMsgClick" text="发送短信" />
                    </ACol>
                </ARow>
            </FormItem>

            <FormItem
                label="新密码"
                name="password"
                :rules="[{ required: true, message: '请输入新密码' }]"
            >
                <InputPassword :maxLength="20" placeholder="设置新密码" />
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

        <ASpace size="large">
            <span
                class="cp"
                @click="
                    () => {
                        onLoginClick ? onLoginClick() : history.push('/auth/login');
                    }
                "
            >
                登录
            </span>
            <span
                class="cp"
                @click="
                    () => {
                        onSignClick ? onSignClick() : history.push('/auth/sign');
                    }
                "
            >
                注册
            </span>
        </ASpace>
    </div>
</template>

<style scoped lang="less">
.sign-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .sign-form {
        width: 100%;
    }
}
</style>
