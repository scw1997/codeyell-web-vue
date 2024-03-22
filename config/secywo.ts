//secywo脚手架公共自定义配置
// import { defineConfig } from 'secywo-template-cli';

const env = process.env.SECYWO_ENV;
import routes from './routes';
export default {
    define: {
        ENV: env,
        API_HOST: env === 'prod' ? 'https://api.codeyell.com' : 'https://codesecond-api.qidb.cn'
    },
    router: {
        type: 'browser',
        routes
    }
};
