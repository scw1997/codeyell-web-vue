//swico dev环境自定义配置

import routes, { devRoutes } from './routes';
import { defineConfig } from 'swico/vue';
export default defineConfig('dev', {
    router: {
        routes: [...routes, ...devRoutes]
    }
});
