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
declare const Swico: SwicoType;

type EmptyObject = {
    [K in PropertyKey]: never;
};

declare type SwicoHistoryOptionType = {
    query?: Record<string, any>;
    params?: Record<string, any>;
    hash?: string;
    path?: string;
    name?: string;
};

declare type SwicoHistoryType = {
    push: (to: string | SwicoHistoryOptionType) => void;
    replace: SwicoHistoryType['push'];
    go: (delta: number) => void;
    back: () => void;
};

declare type SwicoType = {
    history: SwicoHistoryType;
};
