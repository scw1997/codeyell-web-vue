import { createRouter, createWebHistory } from 'vue-router';
import Index from '../views/Index.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'index',
            component: Index
        },
        //示例页
        {
            path: '/example',
            name: 'example',
            component: () => import('../views/example/Index.vue'),
            children: [
                {
                    path: 'child-1', // 通过/example/child-1访问
                    component: () => import('../views/example/Child1.vue')
                },
                {
                    path: 'child-2', // 通过/example/child-2访问
                    component: () => import('../views/example/Child2.vue')
                }
            ]
        }
    ]
});

export default router;
