import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/test',
            name: 'test',
            component: () => import('../components/Test.vue')
        },
        {
            path: '/',
            name: 'index',
            component: () => import('../views/Home.vue')
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('../views/search/index.vue')
        },
        {
            path: '/rank',
            name: 'rank',
            component: () => import('../views/rank/index.vue')
        },
        {
            path: '/project',
            name: 'project',
            component: () => import('../views/project/index.vue'),
            children: [
                {
                    path: 'create',
                    name: 'projectCreate',
                    component: () => import('../views/project/create/index.vue')
                },
                {
                    path: 'detail',
                    name: 'projectDetail',
                    component: () => import('../views/project/detail/index.vue')
                },
                {
                    path: 'read',
                    name: 'projectRead',
                    component: () => import('../views/project/read/index.vue')
                }
            ]
        },

        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/index.vue'),
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/views/auth/AuthLogin.vue')
                },
                {
                    path: 'sign',
                    name: 'sign',
                    component: () => import('@/views/auth/AuthSign.vue')
                },
                {
                    path: 'retrieve_pwd',
                    name: 'retrieve',
                    component: () => import('@/views/auth/AuthRetrieve.vue')
                }
            ]
        },
        {
            path: '/my',
            name: 'my',
            component: () => import('@/views/user/my/index.vue'),
            children: [
                {
                    path: 'personal_page',
                    name: 'myPersonal',
                    component: () => import('@/views/user/my/personal/index.vue')
                },
                {
                    path: 'account_settings',
                    name: 'mySettings',
                    component: () => import('@/views/user/my/settings/index.vue')
                }
            ]
        },
        {
            path: '/user',
            name: 'user',
            component: () => import('@/views/user/public/index.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: '404',
            component: () => import('../views/404.vue')
        }
    ]
});

export default router;
