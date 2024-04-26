<script setup lang="ts">
import { QRCode, Empty } from 'ant-design-vue';
import { defineComponent, onMounted, ref, toRefs } from 'vue';
import wxPayLogo from '@/assets/wx_pay_logo.png';
import http from '@/utils/http';
import api from '@/api';
interface StatesType {
    status: 0 | 1 | 2; //当前支付状态
    statusMsg: string;
}

interface PropsType {
    data: {
        codeUrl: string;
        orderId: string;
        point: string | number;
        price: string | number;
    };
}

const props = defineProps<PropsType>();

const emits = defineEmits<{
    success: [orderId: string];
}>();

const states = ref<StatesType>({
    status: 0,
    statusMsg: ''
});
let timer = null;

//获取支付状态
const getPayStatus = async () => {
    const res = await http.post(api.user.getPayStatusMsg, { order_id: props.data?.orderId });
    const { is_paid, trade_state_desc } = res;
    states.value = { status: is_paid, statusMsg: trade_state_desc };
    //如果支付成功，销毁定时器
    if (is_paid === 1) {
        clearInterval(timer);
        timer = null;
        emits('success', props.data?.orderId);
    }
};
onMounted(() => {
    //定时查询状态
    timer = window.setInterval(getPayStatus, 3000);
    return () => {
        clearInterval(timer);
    };
});
</script>

<template>
    <div class="pay-code-root">
        <ARow align="middle" class="pt" justify="center">
            <p v-if="states.status === 0" class="orange">等待支付...</p>
            <p v-if="states.status === 1" class="green">支付成功</p>
            <p v-if="states.status === 2" class="red">
                支付失败：{{ states.statusMsg || '未知错误信息' }}
            </p>
        </ARow>
        <ARow align="middle" class="pt" justify="center">
            <QRCode v-if="!!data.codeUrl" :value="data.codeUrl" />

            <Empty
                v-else
                description="未获取到支付二维码信息"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
        </ARow>
        <ARow align="middle" justify="center">
            <p class="">
                <span class="orange">{{ data.price }}</span>
                元获得
                <span class="orange">{{ data.point }}</span>
                积分
            </p>
        </ARow>
        <ARow align="middle" justify="center">
            <img alt="微信支付" :src="wxPayLogo" width="{{150}}" />
        </ARow>
    </div>
</template>

<style scoped lang="less"></style>
