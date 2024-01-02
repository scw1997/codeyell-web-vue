declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.webp';
declare module '*.less';
declare module '*.vue';

interface Window {
    publicPath: string;
}
type EmptyObject = {
    [K in PropertyKey]: never;
};

declare const API_HOST: string;
