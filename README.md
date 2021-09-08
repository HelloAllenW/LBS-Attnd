### 应用定位
> 考勤 Attnd 是基于 LBS 开发的考勤和签到小程序，同时具有人员简单管理的功能


### 技术栈
> Taro、Taro UI、微信小程序云开发


### 安装与运行

> 1、Taro CLI

```bash
# 使用 npm 安装 CLI（当前项目仅适用于v1.0版本）
$ npm install -g @tarojs/cli@1.3.46
```

> 2、project.config.json

在根目录新建 project.config.json，拷贝下面这段代码并修改 AppId

```json
{
  "miniprogramRoot": "client/dist/",
  "cloudfunctionRoot": "cloud/functions/",
  "projectname": "attnd-taro",
  "description": "LBS Attnd.",
  "appid": "your AppId",
  "setting": {
    "urlCheck": true,
    "es6": false,
    "postcss": false,
    "minified": false,
    "newFeature": true
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

> 3、安装依赖及编译

进入 client 目录安装依赖

```bash
cd client
npm install
```

等待依赖安装完成，即可运行

接下来这条命令将项目编译成微信小程序

```bash
npm run dev:weapp
```

> 4、注意事项

- 打开微信开发者工具，注意选择项目的根目录打开，即包含 client 和 cloud 目录


### 参考文档
- **本项目在开源项目基础上开发，详情请参考[Lyokoo/LBS-Attnd](https://github.com/Lyokoo/LBS-Attnd)**
- 本项目使用 Taro 开发，参考 [Taro 开发文档](https://nervjs.github.io/taro/docs/next/README)
- 需要开通微信小程序云开发，具体参考 [云开发起步](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- 可使用Taro UI组件库：[TaroUI](https://taro-ui.jd.com/#/docs/introduction)


### 开发过程中笔记
1. 每一个 Taro 项目都有一个入口组件：/client/src/app.js

2. 项目内client文件夹为小程序客户端目录，cloud是云函数目录。
云函数想要可以调用需要通过微信开发者工具进行部署。部署教程：[点我](https://blog.csdn.net/weixin_42597880/article/details/94648104)。
 云函数就相当于服务端接口 



