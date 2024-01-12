//secywo脚手架公共自定义配置

const env = process.env.SECYWO_ENV;
export default {
    define: {
        API_HOST: env === 'prod' ? 'https://api.codeyell.com' : 'https://codesecond-api.qidb.cn'
    }
};
