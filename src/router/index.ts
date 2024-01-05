import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('../views/Index.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: '404',
            component: () => import('../views/404.vue')
        }
    ]
});

export default router;
