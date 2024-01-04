export default {
    //项目代码文件目录树
    getCodeFileTree: '/web/v1/code/file_tree',
    //代码内部关键字搜索
    searchCode: '/web/v1/code/search',
    //获取指定文件代码内容
    getCodeContent: '/web/v1/code/content',
    //获取指定文件的包含注解的代码行数据
    getNoteLineDataByFile: '/web/v1/comment/code/line',
    //创建注解
    createNote: '/web/v1/comment/code/add',
    //赞成/反对注解
    agreeOrDisagreeNote: '/web/v1/comment/code/like',
    //修改注解
    editNote: '/web/v1/comment/code/edit',
    //删除注解
    deleteNote: '/web/v1/comment/code/del',
    //获取指定代码的注解列表
    getNoteListByCode: '/web/v1/comment/code/list',
    //获取指定代码文件指定行的注解列表
    getNoteListByLine: '/web/v1/comment/code/line/list',
    //获取指定注解的二级注解列表
    getChildrenNoteListByNote: '/web/v1/comment/code/list/children'
};
