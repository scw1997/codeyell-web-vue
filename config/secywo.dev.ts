//secywo脚手架自dev环境自定义配置

import routes, { devRoutes } from './routes';
import { defineConfig } from 'secywo-template-cli';
const env = process.env.SECYWO_ENV;
export default defineConfig('dev', {
    router: {
        type: 'browser',
        routes: [...(env === 'dev' ? devRoutes : []), ...routes]
    }
});
