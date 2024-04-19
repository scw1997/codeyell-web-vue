//swico 公共自定义配置

import { defineConfig } from 'swico';

const env = process.env.SWICO_ENV;
import routes from './routes';
export default defineConfig('base', {
    template: 'vue',
    define: {
        ENV: env,
        API_HOST: env === 'prod' ? 'https://api.codeyell.com' : 'https://codesecond-api.qidb.cn'
    },
    router: {
        routes
    }
});
