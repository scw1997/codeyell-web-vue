import { createRouter, createWebHistory, RouteRecordRaw, useRouter } from 'vue-router';
import useReadStore from '@/store/read';
import useGlobalStore from '@/store/global';
import { toRefs } from 'vue';

const devRoutes: RouteRecordRaw[] = [
    {
        path: '/demo',
        name: 'demo',
        component: () => import('../views/demo/Demo.vue')
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...(ENV === 'dev' ? devRoutes : []),
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Home.vue')
        },

        {
            path: '/project',
            name: 'project',
            children: [
                {
                    path: 'list',
                    name: 'project-list',
                    component: () => import('../views/project/ProjectList.vue')
                },
                {
                    path: 'create',
                    name: 'project-create',
                    component: () => import('../views/project/ProjectCreate.vue')
                },
                {
                    path: 'search',
                    name: 'project-search',
                    component: () => import('../views/project/ProjectSearch.vue')
                },
                {
                    path: 'detail',
                    name: 'project-detail',
                    component: () => import('../views/project/ProjectDetail.vue')
                },
                {
                    path: 'read',
                    name: 'project-read',
                    component: () => import('../views/project/read/ProjectRead.vue')
                }
            ]
        },

        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/Auth.vue'),
            children: [
                {
                    path: 'login',
                    name: 'auth-login',
                    component: () => import('@/views/auth/AuthLogin.vue')
                },
                {
                    path: 'sign',
                    name: 'auth-sign',
                    component: () => import('@/views/auth/AuthSign.vue')
                },
                {
                    path: 'retrieve_pwd',
                    name: 'auth-retrieve',
                    component: () => import('@/views/auth/AuthRetrieve.vue')
                }
            ]
        },
        {
            path: '/my',
            name: 'my',
            component: () => import('@/views/user/my/My.vue'),
            children: [
                {
                    path: 'personal_page',
                    name: 'my-personal',
                    component: () => import('@/views/user/my/personal/MyPersonal.vue')
                },
                {
                    path: 'account_settings',
                    name: 'my-settings',
                    component: () => import('@/views/user/my/MySettings.vue')
                }
            ]
        },
        {
            path: '/article',
            name: 'article',
            children: [
                {
                    path: 'detail',
                    name: 'article-detail',
                    component: () => import('@/views/article/ArticleDetail.vue')
                }
            ]
        },
        {
            path: '/user',
            name: 'user',
            children: [
                {
                    path: 'rank',
                    name: 'user-rank',
                    component: () => import('../views/user/UserRank.vue')
                },
                {
                    path: 'public',
                    name: 'user-public',
                    component: () => import('../views/user/UserPublic.vue')
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: '404',
            component: () => import('../views/404.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const { name, path, fullPath } = to;
    const readStore = useReadStore();
    const { token } = toRefs(useGlobalStore());
    if (name === 'project-read') {
        //访问项目阅读页判断跳转来源，若是新开独立页面，则点击阅读页左上角时返回到项目详情页，否则返回上一页
        readStore.setIsPush(!(from.path === '/'));
        next();
    } else if (
        ['my-personal', 'my-settings', 'project-create'].includes(name as string) &&
        !token.value
    ) {
        //部分页面只能登录后访问
        next({
            name: 'auth-login',
            query: path === '/' ? {} : { redirect_path: fullPath }
        });
    } else {
        next();
    }
});

export default router;
