//secywo脚手架自dev环境自定义配置

import routes, { devRoutes } from './routes';
const env = process.env.SECYWO_ENV;
console.log('env', env);
export default {
    router: {
        type: 'browser',
        routes: [...(env === 'dev' ? devRoutes : []), ...routes]
    }
};
