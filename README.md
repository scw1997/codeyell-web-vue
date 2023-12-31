# secywo-template-vue

# 1：简介

个人独立开发的 secywo 脚手架的前端项目Vue模板，基于 Vue3 + TypeScript4 + Webpack5 + Vue-Router4

**模板特点：**

- 基于 Vue + Webpack + Typescript 生态圈最新相关技术栈版本
- 内置`ESLint + Prettier + Husky`三大前端编码风格以及代码提交规范约束插件，保证代码风格统一和质量以及 Git 提交规范

> 此模板为 secywo 脚手架内置Vue前端模板，也可独立拉取此模板进行前端开发

> secywo 脚手架相关：[secywo 源码&文档](https://gitee.com/fanlaBoy/secywo)

# 2：基本命令

1. 启动本地开发环境：`npm run start`
2. 打包构建产物：`npm run build`
3. 打包构建并展示产物体积大小分析页面：`npm run build:analyze`

# 3：目录结构

```bash
├── .husky
├── config
├── dist
├── public
├── src
│   ├── views
│   │   ├── Index.vue
│   │   └── 404.vue
│   │   
│   ├── router
│   │   └── index.ts
│   ├── typings
│   │   └── global.d.ts
│   ├── index.ejs
│   ├── index.tsx
│   └── App.vue
│
├── .eslintignore
├── .eslintrc
├── .prettierignore
├── .prettierrc.js
├── commitlint.config.js
├── package.json
└── tsconfig.json
```

## 根目录

## .husky

husky 配置文件路径，用于提供 git 提交前的操作钩子。如
pre-commit（提交前的操作），commit-msg（提交信息校验）。

pre-commit默认配置：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:staged
```

> 此默认配置为git提交前调用lint:staged终端命令，通过eslint + prettier进行代码格式校验和修复，若校验不通过则禁止提交

> 配置文档：[husky 官方文档](https://typicode.github.io/husky/#/)


> 执行 npm run start 后自动生成.husky文件

## config

包含 secywo 自定义 webpack 配置项相关文件，可包含以下三种 es module 文件（即需要有默认导出配置项）

- **secywo.ts** （通用公共配置）
- **secywo.dev.ts** （开发环境专属配置，若与 secywo.ts 存在配置项冲突，以当前配置项优先）
- **secywo.prod.ts** （生产环境专属配置，若与 secywo.ts 存在配置项冲突，以当前配置项优先）

可配置项包含：

- **plugins**

  webpack plugin 的相关配置，用于根据业务需要额外的一些 plugin 设置。（默认为`空数组[]`）

- **publicPath**（仅`secywo.ts`可配置）

  配置 webpack 的 publicPath 选项，通常在服务器部署项目到非根目录下时使用。（默认值为`/`）


- **console** （仅`secywo.prod.ts`可配置）

  是否显示 console 打印日志信息（默认值为`true`）

- **define** （仅`secywo.ts`可配置）

  设置代码中可访问的变量。 支持通过普通函数或promise返回对应的变量对象

  比如，

  `define: { FOO: 'bar' }`

  然后代码里的 `console.log(hello, FOO)` 会被编译成 `console.log(hello, 'bar')`。

  > 当你在 ts 的项目中使用这些变量时，你需要在 typings 文件中声明变量类型，以支持 ts 类型提示

  > 注意：每个属性值会进行一次JSON.stringify转换

- **proxy** （仅`secywo.dev.ts`可配置）

  webpack devServer
  配置请求代理（详见 [devServer proxy文档](https://webpack.docschina.org/configuration/dev-server/#devserverproxy)）

- **alias** （仅`secywo.ts`可配置）

  配置别名，对 import 语句的 source 做映射。例如`{'image':'public/image'}`则映射为`根路径/public/image`

  > 当你在 ts 的项目中使用此import映射时，你需要在`tsconfig.json`文件需要设置声明`paths`选项，以支持 ts 类型提示。
  ```json

  {
  "compilerOptions": {
  
    "paths": {
       "@/*": [ "src/*"],
       "apiPath/*": ["src/api/*"]
    }

  }

  }
  ```

  > 框架默认已配置`@`映射为`/src`目录

配置代码示例：

```typescript
//config/secywo.ts
export default {
    alias: {
        'apiPath': 'src/api'
    },
    define: {
        FOO: 'foo',
    },
    // 或者通过promise返回obj
    // define: () => {
    //     return new Promise(resolve => {
    //         resolve({FOO:'foo'})
    //     })
    // }
};


//config/secywo.prod.ts
export default {
    //插件
    plugins: [
        //优化moment包体积，构建时忽略外国语言包
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
    ],
    console: true, //生产环境保留console
};

//config/secywo.dev.ts
export default {
    proxy: {
        '/api/report': {
            target: 'http://localhost:4000', // 跨域目标主机，自行修改
            ws: true, // 代理 websockets
            changeOrigin: true,
            pathRewrite: {
                '^/api': '' // 重写地址
            }
        }
    }
};
```

## dist

默认打包构建产物输出路径

## public

此目录下所有文件（夹）会完全按原有路径结构被 copy 到打包构建产物的根路径(dist)下。

可用于存放静态资源文件，并在项目代码中通过根路径引入该文件

示例：

```vue
<!--src/views/Index.vue-->

<template>
  <div class="welcome">
    <img alt="logo" src="/logo.png" />
    <h2 style=" color: #3a95a7">Welcome to Secywo!</h2>
  </div>
</template>

```

## views

页面组件，样式文件路径

其中样式文件支持 `css` 和 `less` 文件的引入，并且对以`module.(css|less)`
命名结尾的样式文件默认开启`Webpack CSS Modules`

示例：

```vue
<!--//src/views/Index.vue-->
<script setup lang="ts">

</script>

<template>
  <div class="welcome">
    <img alt="logo" src="/logo.png" />
    <h2 style=" color: #3a95a7">Welcome to Secywo!</h2>
  </div>
</template>

<style scoped lang="less">
.welcome {
  inset: 0 0 0 0;
  position: absolute;
  width: 100%;
  height: max-content;
  margin: auto;
  text-align: center;

  img {
    max-width: 100%;
  }
}

</style>
```

> css modules相关文档：[css modules](https://webpack.docschina.org/loaders/postcss-loader#css-modules)

## router

路由相关配置，模板已默认配置了基于 Vue-Router 4 的基本路由配置


```ts
//src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Index from '../views/Index.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    //示例页
    {
      path: '/example',
      name: 'example',
      component: () => import('../views/example/Index.vue'),
      children: [
        {
          path: 'child-1', // 通过/example/child-1访问
          component: () => import('../views/example/Child1.vue')
        },
        {
          path: 'child-2', // 通过/example/child-2访问
          component: () => import('../views/example/Child2.vue')
        }
      ]
    }
  ]
});

export default router;


```

> 更多路由配置可参考：[Vue-Router V4 官方文档](https://router.vuejs.org/zh/)

## typings

主要存放全局 typescrtipt 类型声明文件(`.d.ts`)

```typescript
///src/typings/global.d.ts
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

```

## index.ejs

项目的 index.html 模板文件。可在这里进行一些全局的 js 内容引入等操作

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta
            name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
     <link rel="shortcut icon" href="/favicon.ico" />
    <Title>Secywo App</Title>
    <script>
        <!-- webpack publicPath配置项，可在代码中访问       -->
        window.publicPath = '<%= publicPath %>'
    </script>
</head>
<body>
<div id="root">
    <!-- 页面在这里渲染            -->
</div>
</body>
</html>

```

## App.vue

Vue 全局顶层组件

## index.ts

用于渲染 Vue 全局顶层组件并创建应用实例

## .eslintignore，.eslintrc

eslint 相关配置文件，可根据业务需求自行修改

## .prettierignore，.prettierrc.js

prettier 相关配置文件，可根据业务需求自行修改

## commitlint.config.js

git 提交格式规范校验规则配置文件`（配合 husky commit-msg进行git commit的提交信息的格式校验）`

> 可根据官方文档自行调整配置

```javascript
//默认配置
module.exports = {
    // 继承的规则
    extends: ['@commitlint/config-conventional'],
    // 定义规则类型
    rules: {
        // type 类型定义，表示 git 提交的 type 必须在以下类型范围内
        'type-enum': [
            2,
            'always',
            [
                'add', // 新功能 feature
                'fix', // 修复 bug
                'docs', // 文档注释
                'config', // 架构配置修改
                'perf', // 性能优化
                'test', // 增加测试
                'revert', // 回退
                'others' // 其他
            ]
        ],
        // subject 大小写不做校验
        'subject-case': [0]
    }
};
```

基于上述默认配置，git 提交时填写提交内容的说明信息需遵循以下格式（否则系统禁止提交）：

```markdown
[type]: 说明信息
```

> 注意中间是英文冒号+空格

type 主要有以下几种：

- `config`: 项目构建配置的变动
- `docs`: 仅仅修改了文档等（不是指文案类的改动，而是指项目文档、代码注释等）
- `fix`: 修复 bug
- `add`: 增加新功能
- `perf`: 各种业务代码的修改，优化
- `revert`: 代码回滚
- `test`: 测试用例代码
- `others`:其他类型的更改（非即以上类型的改动）

> commitlint 官方文档：[https://commitlint.js.org/#/guides-local-setup](https://commitlint.js.org/#/guides-local-setup)
