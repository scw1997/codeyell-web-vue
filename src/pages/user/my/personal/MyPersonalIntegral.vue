<script setup lang="ts">
import {
    TypographyLink,
    Empty,
    Tabs,
    TabPane,
    App,
    FormItem,
    TypographyText
} from 'ant-design-vue';
import { onMounted, ref, watch, h } from 'vue';
import useGlobalStore from '@/store/global';
import { Pagination, PureTabs } from '@/components';
import { storeToRefs } from 'pinia';
import Toast from '@/utils/Toast';
import { dateFormat, debounce, fenToYuan } from '@/utils/tools';
import http from '@/utils/http';
import api from '@/api';
import PayCode from '@/pages/user/my/personal/PayCode.vue';

const { modal } = App.useApp();
const globalStore = useGlobalStore();
const { getIntegralRules, refreshMyData } = globalStore;
const { userInfo, integralRulesData } = storeToRefs(globalStore);
interface StatesType {
    logList: any[]; //当前页积分记录列表数据
    logParams: Record<string, any>;
    withdrawList: any[]; //当前页积分记录列表数据
    withdrawParams: Record<string, any>;
    withdrawLastone: Record<string, any>;
    buyPoint: number;
    buyPrice: number;
    pointErrVisible: boolean;
    pointBuyActiveKey: string;
    pointListActiveKey: string;
    pointExtraTips: string;
    shareUrl: string;
    withdrawFormModel: Record<string, any>;
}

const pointBuyTabConfig = [
    {
        name: '积分购买',
        key: 'buy'
    },
    {
        name: '积分提现',
        key: 'withdraw'
    }
];
const pointListTabConfig = [
    {
        name: '积分明细',
        key: 'in'
    },
    {
        name: '提现明细',
        key: 'out'
    }
];

const states = ref<StatesType>({
    logList: [],
    logParams: {},
    withdrawList: [],
    withdrawParams: {},
    withdrawLastone: {},
    buyPoint: 100,
    buyPrice: 10,
    pointBuyActiveKey: 'buy',
    pointListActiveKey: 'in',
    pointErrVisible: false,
    pointExtraTips: '平台收取5%手续费',
    shareUrl: '',
    withdrawFormModel: {
        point: '',
        bank_receiver: '',
        bank_account: '',
        bank_name: '',
        bank_deposit: ''
    }
});

let payModalHandler = null;

onMounted(() => {
    if (!integralRulesData.value) {
        getIntegralRules();
    }
    getPrice(states.value.buyPoint);
    getWithdrawLastone();
});

//购买积分成功回调
const handlePaySuccess = () => {
    payModalHandler?.destroy();
    Toast.success('购买积分成功');
    //刷新积分明细
    states.value.logParams = { ...states.value.logParams };

    //更新用户积分
    refreshMyData();
};
//点击支付，获取支付二维码
const handlePay = debounce(async () => {
    const { buyPoint, buyPrice } = states.value;
    Toast.loading(true);
    const data = await http.post(api.user.getPayCode, { point: buyPoint });
    Toast.loading(false);
    const { code_url, order_id } = data;

    const compPropsData = {
        codeUrl: code_url,
        orderId: order_id,
        point: buyPoint,
        price: buyPrice
    };

    payModalHandler.current = modal.info({
        title: '积分购买',
        // className: 'method-modal-reset',
        width: 400,
        closable: true,
        footer: null,
        content: h(PayCode, { data: compPropsData, onSuccess: handlePaySuccess })
    });
});

//根据积分获取价格
const getPrice = debounce(async (point: number) => {
    const data = await http.post(api.user.getPriceByPoint, { point });
    const { price_yuan } = data;
    states.value.buyPrice = price_yuan || 0;
}, 300);

const getWithdrawLastone = async () => {
    const data = await http.post(api.user.getPointWithdrawLastone);
    states.value.withdrawFormModel = data;
};

const handleBuyPointChange = (e) => {
    const value = (e.target as HTMLInputElement).value;
    if (value && /^([1-9]\d{0,3}|10000)$/.test(value)) {
        const numValue = Number(value);
        states.value = { ...states.value, buyPoint: numValue, pointErrVisible: false };
        getPrice(Number(value));
    } else {
        states.value.pointErrVisible = true;
    }
};

//基本信息校验通过，点击保存
const handleWithdrawFormFinish = debounce(async (formValue: Record<string, any>) => {
    Toast.loading(true);
    formValue.point = parseInt(formValue.point);
    await http.post(api.user.addPointWithdraw, formValue);
    Toast.success('提交成功，系统将在2个工作日内处理完成。请通过“提现明细”查看处理进展');
    //刷新积分明细和提现明细
    refreshMyData();
    states.value = {
        ...states.value,
        logParams: { ...states.value.logParams },
        withdrawParams: { ...states.value.withdrawParams }
    };
}, 200);

const pointChange = async (e: any) => {
    if (parseInt(e.target.value) < 200) {
        return;
    }
    const data = await http.post(api.user.getPointWithdrawFee, { point: parseInt(e.target.value) });

    states.value.pointExtraTips = data.msg;
};

const handleBuyTabChange = (key: string) => {
    states.value.pointBuyActiveKey = key;
};
const handleListTabChange = (key: string) => {
    states.value.pointListActiveKey = key;
};

watch(
    userInfo,
    (newValue) => {
        states.value.shareUrl = newValue?.id
            ? `${window.location.origin}/auth/sign?invite_id=${userInfo.value.id}`
            : '';
    },
    { immediate: true }
);
</script>

<template>
    <div class="personal-integral-root">
        <ACard class="share-card mb">
            <ARow align="middle" :gutter="15" justify="space-between">
                <ACol flex="none">
                    <span class="pr title">专属分享链接</span>
                    <TypographyLink v-if="!!states.shareUrl" copyable>
                        {{ states.shareUrl }}
                    </TypographyLink>
                    <span v-else>暂无</span>
                </ACol>
                <ACol flex="none">分享好友注册得积分</ACol>
            </ARow>
        </ACard>

        <ARow class="mb" :gutter="15" justify="space-between">
            <ACol flex="1">
                <ACard class="left-card">
                    <p class="title">积分获取</p>
                    <ol class="list">
                        <template v-if="integralRulesData?.increase.length > 0">
                            <li v-for="(item, index) in integralRulesData.increase" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <Empty v-else description="加载中" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                    </ol>
                </ACard>
            </ACol>
            <ACol flex="1">
                <ACard class="right-card">
                    <p class="title">积分消费</p>
                    <ol class="list">
                        <template v-if="integralRulesData?.decrease.length > 0">
                            <li v-for="(item, index) in integralRulesData.decrease" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <Empty v-else description="加载中" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                    </ol>
                </ACard>
            </ACol>
        </ARow>
        <ACard class="pay-card mb">
            <PureTabs
                :config="pointBuyTabConfig"
                :defaultActiveKey="states.pointBuyActiveKey"
                @change="handleBuyTabChange"
            />
            <KeepAlive>
                <ARow
                    v-if="states.pointBuyActiveKey == 'buy'"
                    align="top"
                    :gutter="15"
                    justify="space-between"
                >
                    <ACol flex="1">
                        <section>
                            <AInput
                                class="point-input"
                                :defaultValue="states.buyPoint"
                                @change="handleBuyPointChange"
                                placeholder="输入欲购买积分数"
                            />

                            <span v-if="states.pointErrVisible" class="err-msg pl">
                                请输入1-10000的正整数
                            </span>

                            <span v-else class="pl">
                                购买
                                <span class="orange">{{ states.buyPoint }}</span>
                                积分，需花费
                                <span class="orange">{{ states.buyPrice }}</span>
                                元
                            </span>
                        </section>
                    </ACol>
                    <ACol flex="none">
                        <AButton
                            :disabled="states.pointErrVisible || !states.buyPrice"
                            @click="handlePay"
                            type="primary"
                        >
                            {{
                                states.pointErrVisible
                                    ? '请输入有效积分值'
                                    : `支付${states.buyPrice}元购买`
                            }}
                        </AButton>
                    </ACol>
                </ARow>
                <AForm
                    v-else
                    :colon="false"
                    :labelCol="{ span: 8 }"
                    name="nest-messages"
                    :model="states.withdrawFormModel"
                    @finish="handleWithdrawFormFinish"
                    :wrapperCol="{ span: 15 }"
                >
                    <ARow align="top" :gutter="24" justify="space-between">
                        <ACol :span="12">
                            <FormItem
                                :extra="states.pointExtraTips"
                                label="提取积分数"
                                name="point"
                                :rules="[
                                    { required: true },
                                    {
                                        type: 'integer',
                                        min: 200,
                                        message: '请输入大于200的整数',
                                        transform(value) {
                                            return parseInt(value);
                                        }
                                    }
                                ]"
                            >
                                <AInput
                                    v-model:value="states.withdrawFormModel.point"
                                    @change="pointChange"
                                    placeholder="请输入整数"
                                    type="number"
                                />
                            </FormItem>
                        </ACol>
                        <ACol :span="12">
                            <FormItem
                                label="收款银行"
                                name="bank_name"
                                :rules="[{ required: true }]"
                            >
                                <AInput
                                    v-model:value="states.withdrawFormModel.bank_name"
                                    placeholder="如：中国银行"
                                />
                            </FormItem>
                        </ACol>
                        <ACol :span="12">
                            <FormItem
                                label="开户行"
                                name="bank_deposit"
                                :rules="[{ required: true }]"
                            >
                                <AInput v-model:value="states.withdrawFormModel.bank_deposit" />
                            </FormItem>
                        </ACol>
                        <ACol :span="12">
                            <FormItem
                                label="收款银行账号"
                                name="bank_account"
                                :rules="[{ required: true }]"
                            >
                                <AInput v-model:value="states.withdrawFormModel.bank_account" />
                            </FormItem>
                        </ACol>
                        <ACol :span="12">
                            <FormItem
                                label="收款人姓名"
                                name="bank_receiver"
                                :rules="[{ required: true }]"
                            >
                                <AInput v-model:value="states.withdrawFormModel.bank_receiver" />
                            </FormItem>
                        </ACol>

                        <ACol :span="24">
                            <FormItem label=" ">
                                <AButton htmlType="submit" type="primary">提交</AButton>
                            </FormItem>
                        </ACol>
                    </ARow>
                </AForm>
            </KeepAlive>
        </ACard>
        <ACard class="integral-card">
            <PureTabs
                :defaultActiveKey="states.pointListActiveKey"
                :config="pointListTabConfig"
                @change="handleListTabChange"
            />
            <KeepAlive>
                <div v-if="states.pointListActiveKey == 'in'">
                    <template v-if="states.logList?.length > 0">
                        <ARow
                            v-for="({ PointChange, Info, CreatedAt }, index) in states.logList"
                            align="bottom"
                            class="mb list-item"
                            :gutter="15"
                            justify="space-between"
                            :key="index"
                        >
                            <ACol flex="none">
                                <div :class="['amount', PointChange > 0 ? 'add' : 'subtract']">
                                    {{ PointChange > 0 ? `+${PointChange}` : `${PointChange}积分` }}
                                </div>
                                <div class="desc" v-html="Info"></div>
                            </ACol>
                            <ACol flex="none">
                                <span>
                                    {{ CreatedAt ? dateFormat(CreatedAt).slice(0, 16) : '时间' }}
                                </span>
                            </ACol>
                        </ARow>
                    </template>

                    <Empty v-else description="暂无记录" :image="Empty.PRESENTED_IMAGE_SIMPLE" />

                    <Pagination
                        class="mt"
                        @change="
                            (data) => {
                                states.logList = data;
                            }
                        "
                        :params="states.logParams"
                        :url="api.user.getMyIntegralLogList"
                    />
                </div>

                <div v-else>
                    <template v-if="states.withdrawList?.length > 0">
                        <ARow
                            v-for="(
                                {
                                    fee_get,
                                    point,
                                    status,
                                    created_at,
                                    bank_account,

                                    bank_name,
                                    msg
                                },
                                index
                            ) in states.logList"
                            align="bottom"
                            class="mb list-item"
                            :gutter="15"
                            justify="space-between"
                            :key="index"
                        >
                            <ACol flex="none">
                                <div>
                                    <TypographyText type="danger">
                                        {{ fenToYuan(fee_get) }}元
                                    </TypographyText>
                                </div>
                                <TypographyText type="secondary">{{ point }}积分</TypographyText>
                            </ACol>
                            <ACol flex="none">
                                <div>
                                    {
                                    <TypographyText v-if="status == 1">
                                        处理中（{{ bank_name }} {{ bank_account }}）
                                    </TypographyText>

                                    <TypographyText v-else-if="status == 2" type="success">
                                        提现成功（{bank_name} {bank_account})
                                    </TypographyText>

                                    <TypographyText v-else-if="status == 3" type="danger">
                                        提现失败: {{ msg }}（{{ bank_name }} {{ bank_account }}）
                                    </TypographyText>
                                    }
                                </div>
                                <div class="text-right">
                                    <TypographyText type="secondary">
                                        {{ dateFormat(created_at).slice(0, 16) }}
                                    </TypographyText>
                                </div>
                            </ACol>
                        </ARow>
                    </template>
                    <Empty v-else description="暂无记录" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
                    <Pagination
                        class="mt"
                        @change="
                            (data) => {
                                states.withdrawList = data;
                            }
                        "
                        :params="states.withdrawParams"
                        :url="api.user.getPointWithdrawList"
                    />
                </div>
            </KeepAlive>
        </ACard>
    </div>
</template>

<style scoped lang="less">
.personal-integral-root {
    .left-card,
    .right-card {
        height: 100%;

        .title {
            margin: 0;
            // font-weight: bold;
        }

        .list {
            padding-left: 14px;
        }
    }

    .integral-card {
        .title {
            margin: 0 0 10px 0;
            // font-weight: bold;
        }

        .list-item {
            padding-bottom: 10px;
            border-bottom: 1px solid #f7f7f7;

            .desc {
                color: #868a8e;
            }
        }

        .amount {
            color: red;

            &.subtract {
                color: #10c15f;
            }
        }

        .text-right {
            text-align: right;
        }
    }

    .pay-card {
        .title {
            margin: 0 0 10px 0;
            font-weight: bold;
        }

        .point-input {
            width: 200px;
        }

        .desc {
            font-size: 12px;
            color: #ed8c2c;
        }

        .err-msg {
            color: red;
        }
    }

    :deep(.pure-tabs-component-root) {
        justify-content: flex-start;

        .tab-item {
            height: 40px;

            margin: 0 20px 20px 0;
        }
    }
}
</style>
