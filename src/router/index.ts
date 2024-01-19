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
            component: () => import('../views/Index.vue')
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('../views/Search.vue')
        },
        {
            path: '/rank',
            name: 'rank',
            component: () => import('../views/Rank.vue')
        },
        {
            path: '/project',
            name: 'project',
            component: () => import('../views/project/Index.vue'),
            children: [
                {
                    path: 'create',
                    name: 'projectCreate',
                    component: () => import('../views/project/Create.vue')
                },
                {
                    path: 'detail',
                    name: 'projectDetail',
                    component: () => import('../views/project/Detail.vue')
                },
                {
                    path: 'read',
                    name: 'projectRead',
                    component: () => import('../views/project/read/Index.vue')
                }
            ]
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/Index.vue'),
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/views/auth/Login.vue')
                },
                {
                    path: 'sign',
                    name: 'sign',
                    component: () => import('@/views/auth/Sign.vue')
                },
                {
                    path: 'retrieve_pwd',
                    name: 'retrieve',
                    component: () => import('@/views/auth/Retrieve.vue')
                }
            ]
        },
        {
            path: '/my',
            name: 'my',
            component: () => import('@/views/user/my/Index.vue'),
            children: [
                {
                    path: 'personal_page',
                    name: 'myPersonal',
                    component: () => import('@/views/user/my/PersonalPage.vue')
                },
                {
                    path: 'account_settings',
                    name: 'mySettings',
                    component: () => import('@/views/user/my/AccountSettings.vue')
                }
            ]
        },
        {
            path: '/user',
            name: 'user',
            component: () => import('@/views/user/Public.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: '404',
            component: () => import('../views/404.vue')
        }
    ]
});

export default router;
