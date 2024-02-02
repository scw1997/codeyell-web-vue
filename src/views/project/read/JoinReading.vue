<script setup lang="ts">
import api from '@/api';
import Toast from '@/utils/Toast';
import useReadStore from '@/store/read';
import PayCode from '@/views/user/my/personal/PayCode.vue';
import http, { notifyError } from '@/utils/http';
import { debounce, EMPTY } from '@/utils/tools';
import { App, Empty } from 'ant-design-vue';
import useGlobalStore from '@/store/global';
import { h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

interface StatesType {
    buyPointData?: {
        buy_fee_fen: number;
        point_my: number;
        point_need: number;
        buy_fee_yuan: number;
        buy_point: number;
    }; //额外提示信息
}

const router = useRouter();
const route = useRoute();
const emits = defineEmits<{ success: [] }>();
const readStore = useReadStore();
const globalStore = useGlobalStore();
const { getIntegralRules } = globalStore;
const { integralRulesData, userInfo } = storeToRefs(globalStore);
const { curDetailData: detailData } = storeToRefs(readStore);

const buyPointStates = ref<StatesType['buyPointData'] | null>(null);
const { id: projectId } = route.query;
const { modal } = App.useApp();
let payModalHandler;

//加入阅读
const handleJoinReading = debounce(async (isBuy = false) => {
    //isBuy是否为购买积分行为后的操作，默认为普通加入阅读的行为
    const res = await http.post(
        api.project.joinReading,
        {
            project_id: projectId
        },
        { isControl: true }
    );
    const { data, code, msg } = res;
    const { point_my, point_need, buy_fee_fen } = data || {};
    switch (code) {
        case 1601:
            buyPointStates.value = {
                ...buyPointStates.value,
                buy_fee_yuan: buy_fee_fen / 100 || 0,
                buy_point: point_need - point_my
            };
            break;
        case 200:
            if (isBuy) {
                payModalHandler?.destroy();
            }
            Toast.success('加入阅读成功');
            emits('success');
            break;
        default:
            notifyError(code, msg);
    }
}, 200);

//点击支付，获取支付二维码
const handlePay = debounce(async () => {
    const { buy_point, buy_fee_yuan } = buyPointStates.value!;
    Toast.loading(true);
    const data = await http.post(api.user.getPayCode, {
        point: buy_point,
        project_id: projectId
    });
    Toast.loading(false);
    const { code_url, order_id } = data;

    const compPropsData = {
        codeUrl: code_url,
        orderId: order_id,
        point: buy_point,
        price: buy_fee_yuan
    };
    payModalHandler = modal.info({
        title: '积分购买',
        width: 400,
        closable: true,
        footer: null,
        // content: <PayCode data={compPropsData} onSuccess={handlePaySuccess} />
        content: h(PayCode, { data: compPropsData, onSuccess: handlePaySuccess })
    });
});

onMounted(() => {
    if (!integralRulesData.value) {
        getIntegralRules();
    }
});

const handlePaySuccess = async () => {
    handleJoinReading(true);
};

const openMyIntegralPage = () => {
    window.open('/my/personal_page?tab=integral');
};
</script>

<template>
    <div class="join-reading-root">
        <h3 class="pt">你尚未加入阅读</h3>
        <p>未加入项目只能查看根目录下的注解，加入后可拥有全部权限</p>
        <div class="mb">
            <AButton @click="handleJoinReading(false)" type="primary">
                花费{{ detailData?.point }}积分立即加入
            </AButton>
            <p class="gray cp mt" @click="openMyIntegralPage">
                你当前拥有{{userInfo!.count_point}}积分
            </p>
        </div>

        <section :class="{ 'extra-msg-root': true, hide: !buyPointStates }">
            <div class="buy-point">
                <div class="red mb">
                    积分不够，加入项目需要花费{{ buyPointStates?.point_need }}积分，您当前积分为{{
                        buyPointStates?.point_my
                    }}
                </div>
                <p>
                    <AButton @click="handlePay" type="default">
                        支付{{ buyPointStates?.buy_fee_yuan }}元，获得{{
                            buyPointStates?.buy_point
                        }}
                        积分，立即加入
                    </AButton>
                </p>
            </div>
            <div class="integral-rules">
                <h3 class="title">积分获取</h3>
                <ol class="list">
                    <template v-if="Number(integralRulesData?.increase?.length)">
                        <li :key="index" v-for="(item, index) in integralRulesData?.increase">
                            {{ item }}
                        </li>
                    </template>
                    <Empty
                        v-else
                        description="暂无获取途径"
                        :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    />
                </ol>
                <h3 class="title">积分消费</h3>
                <ol class="list">
                    <template v-if="Number(integralRulesData?.decrease?.length)">
                        <li :key="index" v-for="(item, index) in integralRulesData?.decrease">
                            {{ item }}
                        </li>
                    </template>
                    <Empty
                        v-else
                        description="暂无消费途径"
                        :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    />
                </ol>
            </div>
        </section>
    </div>
</template>

<style scoped lang="less">
.join-reading-root {
    flex: 1;
    padding: 0 20px;

    .extra-msg-root {
        background-color: #f2f2f2;
        border-radius: 5px;
        padding: 20px 14px;
    }
}
</style>
