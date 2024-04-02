<script setup lang="ts">
import { Title } from '@/components';
import { Form, FormInstance, FormItem, InputPassword } from 'ant-design-vue';
import { onMounted, reactive, ref, toRefs } from 'vue';
import { debounce, Reg } from '@/utils/tools';
import Toast from '@/utils/Toast';
import api from '@/api';
import http from '@/utils/http';
import useGlobalStore from '@/store/global';
import { useLocation } from 'swico';
import { storeToRefs } from 'pinia';
import { CountDown } from '@/components';

const globalStore = useGlobalStore();
const { history } = Swico;
const route = useLocation();
//分享链接中的邀请人id
const inviteId = route.query['invite_id'] || undefined;
const formRef = ref<FormInstance>();
const submitLoading = ref<boolean>(false);

const formStates = reactive<{ mobile: string; code: string; password: string }>({
    mobile: '',
    code: '',
    password: ''
});
const props = withDefaults(defineProps<{ isControl?: boolean }>(), { isControl: false });
const emits = defineEmits<{
    success: [];
    login: [];
    retrieveClick: [];
}>();
//点击发送短信
const handleSendMsgClick = async () => {
    const { mobile } = formRef.value.getFieldsValue();
    if (!Reg.mobileTel.test(mobile)) {
        Toast.info('请输入正确的手机号');
        return false;
    }
    Toast.loading(true);
    await http.post(api.auth.sendCode, { mobile });
    Toast.loading(false);
    return true;
};
//点击注册
const handleSignClick = async () => {
    const { mobile: username, password, code } = formRef.value.getFieldsValue();

    try {
        submitLoading.value = true;
        await http.post(api.auth.sign, { username, password, code, from: inviteId });
        Toast.success('注册成功');

        if (props.isControl) {
            emits('success');
        } else {
            history.push({ name: 'auth-login' });
        }
    } finally {
        submitLoading.value = false;
    }
};
onMounted(() => {
    if (inviteId) {
        globalStore.setInviteId(inviteId as string);
    }
});
</script>
<template>
    <div class="sign-content">
        <Title v-if="!isControl" value="登录 - 源码阅读交流平台" />
        <Form
            :model="formStates"
            ref="formRef"
            autoComplete="off"
            class="sign-form"
            :labelCol="{ span: 6 }"
            name="form"
            @finish="handleSignClick"
            :wrapperCol="{ span: 18 }"
        >
            <FormItem
                label="手机号"
                name="mobile"
                :rules="[
                    { required: true, message: '请输入手机号' },
                    {
                        pattern: Reg.mobileTel,
                        message: '手机号格式不正确'
                    }
                ]"
            >
                <AInput :maxLength="11" v-model:value="formStates.mobile" placeholder="手机号" />
            </FormItem>

            <FormItem
                label="短信验证码"
                name="code"
                :rules="[{ required: true, message: '请输入验证码' }]"
            >
                <ARow :gutter="8">
                    <ACol :span="16">
                        <FormItem :noStyle="true">
                            <AInput
                                v-model:value="formStates.code"
                                :maxLength="6"
                                placeholder="验证码"
                            />
                        </FormItem>
                    </ACol>
                    <ACol :span="8">
                        <CountDown :beforeStart="handleSendMsgClick" text="发送短信" />
                    </ACol>
                </ARow>
            </FormItem>

            <FormItem
                label="密码"
                name="password"
                :rules="[{ required: true, message: '请输入密码' }]"
            >
                <InputPassword
                    v-model:value="formStates.password"
                    :maxLength="20"
                    placeholder="密码"
                />
            </FormItem>

            <FormItem
                v-if="!!inviteId"
                label="邀请人ID"
                name="invite"
                :rules="[{ required: false, message: '请输入邀请人id' }]"
            >
                <div>
                    <AInput
                        v-model:value="formStates.mobile"
                        disabled
                        placeholder="请输入邀请人id"
                        readOnly
                    />
                </div>
            </FormItem>

            <FormItem style="text-align: center" :wrapperCol="{ span: 24 }">
                <AButton
                    htmlType="submit"
                    :loading="submitLoading"
                    style="width: 200px"
                    type="primary"
                >
                    注册
                </AButton>
            </FormItem>
        </Form>

        <ASpace size="large">
            <span
                class="cp"
                @click="
                    () => {
                        isControl
                            ? emits('retrieveClick')
                            : history.push({ name: 'auth-retrieve' });
                    }
                "
            >
                找回密码
            </span>
            <span
                class="cp"
                @click="
                    () => {
                        isControl ? emits('login') : history.push({ name: 'auth-login' });
                    }
                "
            >
                登录
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
