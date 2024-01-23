export default {
    //获取我的项目数据
    getMyProList: '/web/v1/my/project',
    //获取我的积分日志
    getMyIntegralLogList: '/web/v1/my/point_log',
    //获取积分规则
    getIntegralRules: '/web/v1/my/point_rule',
    //更新我的基本信息
    updateMyData: '/web/v1/my/info_set',
    //获取我的基本信息
    getMyData: '/web/v1/my/info',
    //修改我的密码
    updateMyPwd: '/web/v1/my/change_password',
    //获取我的注解
    getMyNoteList: '/web/v1/my/comment_code',
    // 计算积分价格
    getPriceByPoint: '/web/v1/order/calcPointPrice',
    // 获取积分支付二维码
    getPayCode: '/web/v1/order/buyPoint',
    // 获取支付状态信息
    getPayStatusMsg: '/web/v1/order/statusPoint',
    // 积分提现
    addPointWithdraw: '/web/v1/my/point_withdraw/add',
    // 提现记录
    getPointWithdrawList: '/web/v1/my/point_withdraw/list',
    //提现费用计算
    getPointWithdrawFee: '/web/v1/my/point_withdraw/fee',
    //用户的最后一次提现记录
    getPointWithdrawLastone: '/web/v1/my/point_withdraw/lastone'
};
