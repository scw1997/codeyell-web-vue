<script setup lang="ts">
import { FormInstance, RadioChangeEvent, RadioGroup, Radio, SelectProps } from 'ant-design-vue';
import { useLocation } from 'secywo-template-cli';
import { onMounted, ref, toRefs, watch } from 'vue';
import useGlobalStore from '@/store/global';
import { storeToRefs } from 'pinia';
import Toast from '@/utils/Toast';
import http, { notifyError } from '@/utils/http';
import api from '@/api';
import { debounce, Reg } from '@/utils/tools';
import { Title } from '@/components';
import { FormItem, InputSearch } from 'ant-design-vue';
interface StatesType {
    existedProId?: string; //当前所拉取项目已存在时的项目id，为undefined说明不存在，可以创建
    type: 'branch' | 'tag'; //拉取类型
    repoData?: Record<string, any>; //拉取的仓库信息
    branchAndTagData: { branchList: SelectProps['options']; tagList: SelectProps['options'] }; //格式化当前所拉项目的分支和tag数据
}

const { history } = Secywo;
const globalStore = useGlobalStore();
const { getLanguageData } = globalStore;
const { languageData } = storeToRefs(globalStore);

const states = ref<StatesType>({
    existedProId: null,
    type: 'branch',
    repoData: null,
    branchAndTagData: { branchList: [], tagList: [] }
});
const formRef = ref<FormInstance>();

const formModelStates = ref({
    url: '',
    language: undefined,
    type: undefined,
    branch: undefined,
    tag: undefined
});

//获取指定地址的仓库信息
const handleGetGitMsg = (url: string) => {
    formRef.value.validateFields(['url']).then(async () => {
        //校验仓库地址格式通过
        Toast.loading(true);
        const data = await http.post(api.project.getProVersion, {
            url: url.trim()
        });
        Toast.loading(false);
        states.value.repoData = data;
        //优先使用返回的仓库信息中的language
        formModelStates.value.language = languageData.value?.find(
            (item) => item.label === data?.info?.Language
        )?.value;
    });
};

//拉取类型变化
const handleTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    states.value.type = value;
};

//校验通过，创建项目
const handleCreatClick = debounce(async (values: Record<string, any>) => {
    const { url, type, tag, branch, language } = values;
    const { Name, CloneUrl } = states.value.repoData?.info || {};
    const name = Name;
    const clone_url = CloneUrl;

    Toast.loading(true);
    const res = await http.post(
        api.project.createPro,
        {
            name,
            clone_url,
            url: url.trim(),
            tag,
            branch,
            language
        },
        { isControl: true }
    );
    const { code, data, msg } = res || {};
    Toast.loading(false);
    if (code === 1309) {
        //项目之前已创建过
        states.value.existedProId = data?.project_id;
    } else if (code === 200) {
        //创建成功
        Toast.success('创建成功');

        //拿到创建后的项目id跳转到项目详情页
        history.push({ name: 'project-detail', query: { id: data?.project_id } });
    } else {
        notifyError(code, msg);
    }
}, 200);

onMounted(() => {
    //获取支持的语言列表
    if (!languageData.value?.length) {
        getLanguageData();
    }
});

watch(
    () => states.value.repoData,
    (newRepoData) => {
        states.value.branchAndTagData = {
            branchList:
                newRepoData?.branches?.map(({ name }: { name: string }) => ({
                    label: name,
                    value: name
                })) || [],
            tagList:
                newRepoData?.tags?.map(({ name }: { name: string }) => ({
                    label: name,
                    value: name
                })) || []
        };
    }
);
</script>
<template>
    <div class="project-create-page-root">
        <Title value="创建项目 - 源码阅读交流平台" />
        <ACard class="main-card">
            <AForm
                autoComplete="off"
                ref="formRef"
                :model="formModelStates"
                :initialValues="{ type: 'branch' }"
                :labelCol="{ span: 6 }"
                name="basic"
                @finish="handleCreatClick"
                :wrapperCol="{ span: 12 }"
            >
                <FormItem
                    label="项目Git地址"
                    name="url"
                    :rules="[
                        { required: true, message: '请输入项目git地址' },
                        {
                            pattern: Reg.url,
                            message: '请输入正确格式的git地址',
                            validator: (_, value, callback) => {
                                const formatValue = value?.trim();
                                if (Reg.url.test(formatValue)) {
                                    callback();
                                }
                                callback(new Error('请输入正确格式的git地址'));
                            }
                        }
                    ]"
                    validateFirst
                >
                    <InputSearch
                        v-model:value="formModelStates.url"
                        enterButton="获取仓库信息"
                        @search="handleGetGitMsg"
                    />
                </FormItem>

                <ARow class="mb" v-if="!!states.existedProId">
                    <ACol class="project-message existed" :offset="4" :span="14">
                        <p>
                            该项目已存在，你可以直接点击
                            <AButton
                                @click="
                                    () => {
                                        history.push({
                                            name: 'project-detail',
                                            query: { id: states.existedProId }
                                        });
                                    }
                                "
                                type="link"
                            >
                                查看详情
                            </AButton>
                        </p>
                    </ACol>
                </ARow>

                <ARow>
                    <ACol class="warning" :offset="4">
                        注意：创建后仓库中代码将公开在平台中，请勿填写不宜公开的项目
                    </ACol>
                </ARow>

                <template v-if="!!states.repoData">
                    <ARow class="mt mb">
                        <ACol class="project-message pt" :offset="4" :span="14">
                            <p class="ellipsis">项目名称：{{ states.repoData?.info?.Name }}</p>
                            <p class="ellipsis">仓库地址：{{ states.repoData?.info?.CloneUrl }}</p>
                            <p class="ellipsis">
                                项目介绍：{{ states.repoData?.info?.Description }}
                            </p>
                        </ACol>
                    </ARow>
                    <FormItem
                        label="项目语言"
                        name="language"
                        :rules="[{ required: true, message: '请选择项目语言' }]"
                    >
                        <ASelect
                            v-model:value="formModelStates.language"
                            :options="languageData"
                            style="width: 200px"
                        />
                    </FormItem>
                    <FormItem
                        label="分支/Tag"
                        name="type"
                        :rules="[{ required: true, message: '请选择拉取类型' }]"
                    >
                        <RadioGroup v-model:value="formModelStates.type" @change="handleTypeChange">
                            <Radio value="branch">拉取分支</Radio>
                            <Radio value="tag">拉取Tag</Radio>
                        </RadioGroup>
                    </FormItem>

                    <FormItem
                        v-if="states.type === 'branch'"
                        label="拉取分支"
                        name="branch"
                        :rules="[{ required: true, message: '请选择拉取分支' }]"
                    >
                        <ASelect
                            v-model:value="formModelStates.branch"
                            :options="states.branchAndTagData.branchList"
                            style="width: 200px"
                        />
                    </FormItem>

                    <FormItem
                        v-else
                        label="拉取Tag"
                        name="tag"
                        :rules="[{ required: true, message: '请选择拉取Tag' }]"
                    >
                        <ASelect
                            v-model:value="formModelStates.tag"
                            :options="states.branchAndTagData.tagList"
                            style="width: 200px"
                        />
                    </FormItem>

                    <FormItem :wrapperCol="{ offset: 8 }">
                        <AButton htmlType="submit" style="width: 250px" type="primary">
                            创建项目
                        </AButton>
                    </FormItem>
                </template>
            </AForm>
        </ACard>
    </div>
</template>

<style scoped lang="less">
.project-create-page-root {
    align-self: flex-start;
    width: 100%;
    display: flex;
    min-height: 600px;

    .main-card {
        width: 100%;

        .warning {
            color: #e06b27;
        }

        .project-message {
            background-color: #f8f8f8;
            padding: 0 20px;
            border-radius: 5px;

            &.existed {
                background-color: #ffbf4b7d;
            }
        }
    }
}
</style>
