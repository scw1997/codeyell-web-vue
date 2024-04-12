//swico dev环境自定义配置

import routes, { devRoutes } from './routes';
import { defineConfig } from 'swico';
const env = process.env.SWICO_ENV;
export default defineConfig('dev', {
    router: {
        routes: [...(env === 'dev' ? devRoutes : []), ...routes]
    }
});
