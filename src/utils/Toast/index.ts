import { message } from 'ant-design-vue';
import './index.less';

interface ToastType {
    success: (content?: string, duration?: number) => Promise<any>;
    fail: ToastType['success'];
    info: (content: string, duration?: number) => Promise<any>;
    loading: (isLoading: boolean, content?: string) => void;
    clear: () => void;
}

message.config({
    duration: 5,
    maxCount: 3
});

const Toast: ToastType = {
    success: (content = '操作成功', duration = 3) => {
        message.destroy();
        return new Promise((resolve, reject) => {
            message.success({
                content,
                duration,
                onClose: () => resolve
            });
        });
    },
    fail: (content = '操作失败', duration = 3) => {
        message.destroy();
        return new Promise((resolve, reject) => {
            message.error({
                content,
                duration,
                onClose: () => resolve
            });
        });
    },
    info: (content, duration = 3) => {
        message.destroy();
        return new Promise((resolve, reject) => {
            message.info({
                content,
                duration,
                onClose: () => resolve
            });
        });
    },

    loading: (loading, content?) => {
        if (loading) {
            message.loading({
                content: content ?? '加载中',
                // className: 'toast-loading-component-root',
                key: 'loading',
                duration: 0
            });
        } else {
            message.destroy('loading');
        }
    },
    clear: () => {
        message.destroy();
    }
};
export default Toast;
