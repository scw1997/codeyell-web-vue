import dayjs from 'dayjs';
// @ts-ignore
import OSS from 'ali-oss';
import http from '@/utils/http';
import api from '@/api';
import Toast from '@/utils/Toast';
import { useRouter } from 'vue-router';

export const EMPTY: EmptyObject = Object.create(null);

/*
    常用正则表达式整理
 */
export const Reg = {
    // 自然数（0，1，2，3，4）
    natureNo: /^(0|[1-9][0-9]*)$/,
    // 非0数量（1，2，3...）
    noZeroAmount: /^[1-9]\d*$/,
    // 手机号码
    mobileTel: /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,
    // 固定电话号码（带区号）
    fixedTel: /^(0\d{2,3})-?(\d{7,8})$/,
    // url地址(以http或https开头)
    url: /^(https?):\/\/[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
    // 邮箱正则
    email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
};

//登录校验函数（处理一些需要登录后才可执行的方法）
export const authFunc: (func: any) => (...args: any[]) => void = (func) => {
    const router = useRouter();
    if (localStorage.getItem('token')) {
        return (...args) => {
            func.call(EMPTY, ...args);
        };
    } else {
        return () => {
            router.push({ name: 'auth-login' });
        };
    }
};

/**
 * 时间戳格式化字符串（针对后台返回的10位时间戳）
 * @param timeStamp
 */
export const dateFormat = (timeStamp: number | string) => {
    const length = String(timeStamp).length;

    const date = new Date(parseInt(`${length === 10 ? `${timeStamp}000` : timeStamp}`));
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 防抖
export const debounce = (fun: (...args: any[]) => void, delay = 200) => {
    let timer: number | null;

    return (...args: any[]) => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = window.setTimeout(() => {
            fun.call(EMPTY, ...args);
            timer = null;
        }, delay);
    };
};
// 节流
export const throttle = (fun: (...args: any[]) => void, delay = 200) => {
    let timer: number | null;

    return (...args: any[]) => {
        if (timer) return;

        timer = window.setTimeout(() => {
            fun.call(EMPTY, ...args);
            timer = null;
        }, delay);
    };
};

/**
 * 文件上传
 * @param file file对象
 */
export const uploadFile: (file: File | Blob) => Promise<{ name?: string; url?: string }> = async (
    file
) => {
    // fileObj对象可以自定义为file对象、Blob数据或者OSS Buffer。
    // 创建并填写Blob数据。
    //const data = new Blob(['Hello OSS']);
    // 创建并填写OSS Buffer内容。
    //const data = new OSS.Buffer(['Hello OSS']);

    //获取oss令牌凭证
    const accessData = await http.post(api.global.getUploadAccess);

    const { AccessKeyId, AccessKeySecret, SecurityToken } = accessData;
    const client = new OSS({
        // yourRegion填写Bucket所在地域。以华东1（杭州）为例，yourRegion填写为oss-cn-hangzhou。
        region: 'oss-cn-shenzhen',
        // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
        accessKeyId: AccessKeyId,
        accessKeySecret: AccessKeySecret,
        // 从STS服务获取的安全令牌（SecurityToken）。
        stsToken: SecurityToken,
        // 填写Bucket名称。
        bucket: 'codeyell',
        endpoint: 'static.codeyell.com',
        cname: true
    });

    const headers = {
        // 指定上传文件的类型。
        // 'Content-Type': 'text/html',
        // 指定该Object被下载时网页的缓存行为。
        // 'Cache-Control': 'no-cache',
        // 指定该Object被下载时的名称。
        // 'Content-Disposition': 'oss_download.txt',
        // 指定该Object被下载时的内容编码格式。
        // 'Content-Encoding': 'UTF-8',
        // 指定过期时间。
        // 'Expires': 'Wed, 08 Jul 2022 16:57:01 GMT',
        // 指定Object的存储类型。
        // 'x-oss-storage-class': 'Standard',
        // 指定Object的访问权限。
        // 'x-oss-object-acl': 'private',
        // 设置Object的标签，可同时设置多个标签。
        // 'x-oss-tagging': 'Tag1=1&Tag2=2',
        // 指定CopyObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
        // 'x-oss-forbid-overwrite': 'true',
    };
    try {
        const result = await client.put(
            wrapOSSKey((file as File).name),
            file
            //{headers}
        );
        const { name, url } = result;
        return { name, url };
    } catch (e) {
        Toast.fail((e as Error).toString());
        return {};
    }
};
/**
 * 将base64转成相应类型内容（用于处理获取代码内容）
 * @param base64
 * @param targetType
 */
export const getContentFromBase64: (
    base64: string,
    targetType?: 'text' | 'blobUrl'
) => Promise<string> = (base64, targetType = 'text') => {
    return new Promise((resolve, reject) => {
        const bstr = atob(base64);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        const blob = new Blob([u8arr], {
            type: 'application/octet-stream'
            // 'Content-Disposition': 'attachment'
        });
        const reader = new FileReader();
        switch (targetType) {
            //读取文件的文本
            case 'text':
                reader.readAsText(blob);
                reader.onload = () => {
                    return resolve(reader.result as string);
                };
                reader.onerror = (ev) => {
                    return reject(reader.error);
                };
                break;
            //转成内存url
            case 'blobUrl':
                return resolve(window.URL.createObjectURL(blob));
        }
    });
};
/**
 * 复制文字到剪贴板（
 * @param text
 */
export const copyToClipboard = async (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

// 封装oss上传key
export const wrapOSSKey = (filename: string) => {
    let data: any = new Date();
    let year: any = data.getFullYear();
    let month: any = data.getMonth() + 1;

    return `
        upload${year.toString()}${month.toString()}
        ${randomString(32) + filename.slice(filename.lastIndexOf('.'))}`;
};

export const randomString = (length: number) => {
    let outString = '';
    let inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
};

export const processOSSLogo = (url: string, isAvatar: boolean) => {
    if (url) {
        return url + '?x-oss-process=image/resize,m_pad,h_64,w_64,color_FFFFFF';
    }
    if (isAvatar) {
        return 'https://static.codeyell.com/system/base/avatar-default.png';
    }
    return 'https://static.codeyell.com/system/base/logo-default.png';
};
export const fenToYuan = (amount: string | number): string => {
    return (Number(amount) / 100).toFixed(2);
};
