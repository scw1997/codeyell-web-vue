export const devRoutes = [
    {
        path: '/demo',
        name: 'demo',
        component: 'demo/Demo'
    }
];

export default [
    {
        path: '/',
        name: 'home',
        component: 'Home'
    },

    {
        path: '/project',
        name: 'project',
        children: [
            {
                path: 'list',
                name: 'project-list',
                component: 'project/ProjectList'
            },
            {
                path: 'create',
                name: 'project-create',
                component: 'project/ProjectCreate'
            },
            {
                path: 'search',
                name: 'project-search',
                component: 'project/ProjectSearch'
            },
            {
                path: 'detail',
                name: 'project-detail',
                component: 'project/ProjectDetail'
            },
            {
                path: 'read',
                name: 'project-read',
                component: 'project/read/ProjectRead'
            }
        ]
    },

    {
        path: '/auth',
        name: 'auth',
        component: 'auth/Auth',
        children: [
            {
                path: 'login',
                name: 'auth-login',
                component: 'auth/AuthLogin'
            },
            {
                path: 'sign',
                name: 'auth-sign',
                component: 'auth/AuthSign'
            },
            {
                path: 'retrieve_pwd',
                name: 'auth-retrieve',
                component: 'auth/AuthRetrieve'
            }
        ]
    },
    {
        path: '/my',
        name: 'my',
        component: 'user/my/My',
        children: [
            {
                path: 'personal_page',
                name: 'my-personal',
                component: 'user/my/personal/MyPersonal'
            },
            {
                path: 'account_settings',
                name: 'my-settings',
                component: 'user/my/MySettings'
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
                auth: 'test',
                component: 'article/ArticleDetail'
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
                component: 'user/UserRank'
            },
            {
                path: 'public',
                name: 'user-public',
                component: 'user/UserPublic'
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: '404'
    }
];
