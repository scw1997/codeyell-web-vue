<script setup lang="ts">
import { FormInstance, FormItem, Upload, InputPassword, UploadProps } from 'ant-design-vue';
import { onMounted, reactive, ref, toRefs, watch } from 'vue';
import Toast from '@/utils/Toast';
import http from '@/utils/http';
import api from '@/api';
import { debounce, uploadFile } from '@/utils/tools';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Title } from '@/components';
import useGlobalStore from '@/store/global';
import { history, useNav } from 'swico/vue';
const nav = useNav();
const formRef = ref<FormInstance>();
const { languageData, getLanguageData, userInfo, refreshMyData, clearUserCache } =
    toRefs(useGlobalStore());

interface StatesType {
    uploadLoading: boolean;
    avatarUrl: string | null;
    fileList: UploadProps['fileList'];
}

interface InfoModelStatesType {
    nickname: string;
    info: string;
    language?: string;
    avatar: string | null;
}

const states = ref<StatesType>({
    uploadLoading: false,
    avatarUrl: null,
    fileList: []
});
//个人信息
const infoModelStates = ref<InfoModelStatesType>({
    nickname: '',
    info: '',
    language: undefined,
    avatar: null
});
// 修改密码
const pwdModelStates = ref({
    old_password: '',
    new_password: '',
    sure_password: ''
});

//修改密码表单校验通过，处理修改
const handleUpdatePwdFormFinish = debounce(async (formValue: Record<string, any>) => {
    console.log('formValue', formValue);
    const { old_password, new_password, sure_password } = formValue;
    if (old_password === new_password) {
        return Toast.info('新密码不可与旧密码相同');
    }
    if (sure_password !== new_password) {
        return Toast.info('两次输入新密码不一致');
    }
    Toast.loading(true);
    await http.post(api.user.updateMyPwd, { old_password, new_password });
    Toast.success('修改成功，请用新密码重新登录');
    clearUserCache.value();
    nav({ name: 'auth-login' });
}, 200);

//基本信息校验通过，点击保存
const handleMyDataFormFinish = debounce(async (formValue: Record<string, any>) => {
    console.log('formValue', formValue);
    Toast.loading(true);
    await http.post(api.user.updateMyData, { ...formValue, avatar: states.value.avatarUrl });
    Toast.success('保存成功');
    //刷新用户信息
    refreshMyData.value();
}, 200);

//处理头像上传,返回true则添加
const beforeAvatarUpload = async (file: File) => {
    const { url } = await uploadFile(file);
    states.value.avatarUrl = url;

    return url;
};
onMounted(() => {
    if (languageData.value.length === 0) {
        getLanguageData.value();
    }
});
watch([() => states.value.avatarUrl], () => {
    const avatarUrl = states.value.avatarUrl;
    states.value.fileList = avatarUrl ? [{ name: '头像', url: avatarUrl, uid: avatarUrl }] : [];
});

watch(
    [userInfo, languageData],
    () => {
        if (userInfo.value && languageData.value) {
            const { nickname, info, language, avatar } = userInfo.value;

            infoModelStates.value = {
                nickname,
                info,
                language: language?.length > 0 ? language : undefined,
                avatar: avatar || null
            };
            states.value.avatarUrl = avatar;
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="account-settings-root">
        <Title value="个人中心 - 源码阅读交流平台" />
        <ACard class="basic-card mb">
            <AForm
                ref="formRef"
                :model="infoModelStates"
                auto-complete="off"
                :label-col="{ span: 6 }"
                name="basic"
                :wrapper-col="{ span: 10 }"
                @finish="
                    (values) => {
                        handleMyDataFormFinish(values);
                    }
                "
            >
                <FormItem
                    label="昵称"
                    name="nickname"
                    :rules="[{ required: true, message: '请输入昵称' }]"
                >
                    <AInput
                        v-model:value="infoModelStates.nickname"
                        :max-length="20"
                        placeholder="单行输入"
                    />
                </FormItem>

                <FormItem
                    label="简介"
                    name="info"
                    :rules="[{ required: false, message: '请输入简介' }]"
                >
                    <AInput
                        v-model:value="infoModelStates.info"
                        :max-length="100"
                        placeholder="单行输入"
                    />
                </FormItem>

                <FormItem
                    label="关注的语言"
                    name="language"
                    :rules="[{ required: false, message: '请选择关注语言' }]"
                >
                    <ASelect
                        v-model:value="infoModelStates.language"
                        :max-tag-count="3"
                        mode="multiple"
                        :options="languageData"
                    />
                </FormItem>

                <FormItem
                    v-model:value="infoModelStates.avatar"
                    label="头像"
                    name="avatar"
                    :rules="[{ required: false, message: '请上传头像' }]"
                >
                    <div>
                        <Upload
                            accept=".jpg,.png,.webp"
                            :before-upload="beforeAvatarUpload"
                            :file-list="states.fileList"
                            list-type="picture-card"
                            :max-count="1"
                            name="avatar"
                            :on-remove="
                                () => {
                                    states.avatarUrl = null;
                                }
                            "
                        >
                            <div>
                                <component
                                    :is="states.uploadLoading ? LoadingOutlined : PlusOutlined"
                                />
                                <div style="margin-top: 0">
Upload
</div>
                            </div>
                        </Upload>
                    </div>
                </FormItem>

                <FormItem :wrapper-col="{ offset: 8, span: 6 }">
                    <AButton html-type="submit" style="width: 100%" type="primary">
保存
</AButton>
                </FormItem>
            </AForm>
        </ACard>
        <ACard class="password-card">
            <AForm
                :model="pwdModelStates"
                auto-complete="off"
                :initial-values="{ remember: true }"
                :label-col="{ span: 6 }"
                name="password"
                :wrapper-col="{ span: 9 }"
                @finish="handleUpdatePwdFormFinish"
            >
                <FormItem
                    label="旧密码"
                    name="old_password"
                    :rules="[{ required: true, message: '请输入旧密码' }]"
                >
                    <InputPassword
                        v-model:value="pwdModelStates.old_password"
                        autocomplete="on"
                        :max-length="20"
                        placeholder="单行输入"
                    />
                </FormItem>

                <FormItem
                    label="新密码"
                    name="new_password"
                    :rules="[{ required: true, message: '请输入新密码' }]"
                >
                    <InputPassword
                        v-model:value="pwdModelStates.new_password"
                        autocomplete="on"
                        :max-length="20"
                        placeholder="单行输入"
                    />
                </FormItem>

                <FormItem
                    label="确认新密码"
                    name="sure_password"
                    :rules="[{ required: true, message: '请确认新密码' }]"
                >
                    <InputPassword
                        v-model:value="pwdModelStates.sure_password"
                        autocomplete="on"
                        :max-length="20"
                        placeholder="单行输入"
                    />
                </FormItem>

                <FormItem :wrapper-col="{ offset: 8, span: 6 }">
                    <AButton html-type="submit" style="width: 100%" type="primary">
                        修改密码
                    </AButton>
                </FormItem>
            </AForm>
        </ACard>
    </div>
</template>

<style scoped lang="less"></style>
