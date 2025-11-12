//swico 公共自定义配置

import { defineConfig } from 'swico';

const env = process.env.SWICO_ENV;
import routes from './routes';
export default defineConfig('base', {
    template: 'vue',
    define: {
        API_HOST: env === 'prod' ? 'https://api.codeyell.com' : 'https://api.codeyell.com'
    },
    router: {
        routes
    }
});
