export default {
    //创建项目评论
    createProComment: '/web/v1/comment/project/add',
    //点赞/取消点赞
    likeOrCancel: '/web/v1/comment/project/like',
    //更新项目评论
    editComment: '/web/v1/comment/project/edit',
    //删除项目评论
    deleteComment: '/web/v1/comment/project/del',
    //获取指定项目的注解列表
    getCommentListByCode: '/web/v1/comment/code/list',
    //获取指定项目的评论列表
    getCommentListByPro: '/web/v1/comment/project/list',
    //获取指定评论的二级评论列表
    getChildrenCommentListByComment: '/web/v1/comment/project/list/children',
    //近期热门评论列表
    getRecentHotCommentList: '/web/v1/comment/code/recent'
};
