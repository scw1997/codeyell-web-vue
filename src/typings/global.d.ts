declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.webp';
declare module '*.less';
declare module '*.vue';
declare const ENV: 'dev' | 'prod';
declare const API_HOST: string;
declare const Navigation: any;
declare const App: any;

interface Window {
    publicPath: string;
}
type EmptyObject = {
    [K in PropertyKey]: never;
};
