import Toast from '@/utils/Toast';
import { notification } from 'ant-design-vue';
import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import useGlobalStore from '@/store/global';
import router from '@/router';

const CancelToken = Axios.CancelToken;

type CustomConfig = {
    isControl?: boolean; //为true则在服务端成功返回响应数据时，不进行code报错判断提示，由开发自行控制
};

export const notifyError = (code: string | number, message: string, onClose?: () => void) => {
    Toast.clear();
    notification.error({
        key: Date.now().toString(),
        message: `请求失败 ${code || 'Error'}`,
        description: message,
        placement: 'top',
        duration: 3,
        onClose: onClose
    });
};

export type HttpMethod = (
    url: string,
    params?: any,
    config?: AxiosRequestConfig & CustomConfig
) => Promise<any>;

const instance: AxiosInstance = Axios.create({
    timeout: 10000
});

/**
 * 拦截器
 */
instance.interceptors.request.use(
    (config) => {
        const store = useGlobalStore();
        if (config.method === 'post') {
            config.headers['Content-Type'] = 'application/json';
        }
        config.headers.authorization = `Bearer ${store.token}`;

        return config;
    },
    (err: AxiosError) => {
        return Promise.reject(err);
    }
);
let isNotifying = false; // 控制同时只能显示一个登录失效的提醒
instance.interceptors.response.use(
    (res: AxiosResponse) => {
        return res;
    },
    (err: AxiosError) => {
        const store = useGlobalStore();

        if (!navigator.onLine) {
            return Promise.reject(new AxiosError('当前网络存在问题，请检查后重试', '-1'));
        }

        switch (err?.response?.status) {
            case 401:
                //登录状态失效
                store.clearUserCache();
                if (isNotifying) {
                    return;
                }
                isNotifying = true;
                router.push({ name: 'auth-login' });
                return Promise.reject(new AxiosError('登录状态已失效，请重新登录', '401'));
            case 403:
                //登录失败（例如非管理员）
                return Promise.reject(
                    new AxiosError('您当前无权限访问此资源，请联系管理员', '403')
                );
            case 404:
                return Promise.reject(new AxiosError('抱歉，您访问的接口地址貌似不存在', '404'));
            case 500:
                return Promise.reject(new AxiosError('抱歉，当前服务器异常，请稍后再试', '500'));
        }
        return Promise.reject(new AxiosError(err.message, err.response?.status.toString()));
    }
);

/**
 * 处理response数据
 * @param res
 * @param resolve
 * @param reject
 * @param config
 */
const handleRes = async (
    res: AxiosResponse,
    resolve: (data: any) => void,
    reject: (reason: any) => void,
    config?: Parameters<HttpMethod>[2]
) => {
    const store = useGlobalStore();
    if (res?.status === 200) {
        let { code, msg, data } = res?.data || {};

        switch (code) {
            case 200:
                return config?.isControl ? resolve(res?.data) : resolve(data);
            case 1103:
                store.clearUserCache();
                //登录状态失效
                if (isNotifying) {
                    return;
                }
                isNotifying = true;

                notifyError(code, '请先登录', () => {
                    isNotifying = false;
                });

                router.push({ name: 'auth-login' });

                return;
            default:
                if (config?.isControl) {
                    return resolve(res.data);
                }
                notifyError(code, msg);
                reject(msg);
        }
    } else {
        const { statusText = '数据请求失败' } = res || {};
        if (!config?.isControl) {
            notifyError(res?.status, statusText);
        }
        reject(statusText);
    }
};

export let cancelReqFun = (msg: string) => {
    //取消当前正在执行的请求
    //
};

const createHttpMethod = (
    method: 'get' | 'post',
    url: string,
    data: any,
    config?: Parameters<HttpMethod>[2]
) => {
    return new Promise((resolve, reject) => {
        instance[method](API_HOST + url, data, {
            ...config,
            cancelToken: new CancelToken(function (cancel) {
                cancelReqFun = cancel;
            })
        })
            .then((res: AxiosResponse) => {
                handleRes(res, resolve, reject, config);
            })
            .catch(async (err: { code: string | number; msg: string }) => {
                const { code, msg } = err;

                notifyError(code, msg, () => {
                    isNotifying = false;
                });
                reject(msg);
            });
    });
};

const post: HttpMethod = (...params) => createHttpMethod('post', ...params);
const get: HttpMethod = (...params) => createHttpMethod('get', ...params);

export default {
    get,
    post
};
