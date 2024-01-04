export default {
    //创建项目
    createPro: '/web/v1/project/create',
    //获取项目版本信息
    getProVersion: '/web/v1/project/repo_info',
    //获取项目目录
    getProDirectory: '/web/v1/project/file_tree',
    //获取项目详情
    getProDetail: '/web/v1/project/detail',
    //获取最近项目列表
    getRecentProList: '/web/v1/project/recent',
    //获取项目列表，可按语文搜索
    geProList: '/web/v1/project/list',
    //获取热门项目列表
    getHotProList: '/web/v1/project/hot',
    //搜索项目
    searchPro: '/web/v1/project/search',
    //加入指定项目的阅读
    joinReading: '/web/v1/project/member/add',
    //查询是否已加入指定项目的阅读
    getJoinOrNot: '/web/v1/project/member/isadded'
};
