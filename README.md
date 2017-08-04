# sx-fetch

基于[axios](https://github.com/mzabriskie/axios)的前端网络请求库。

## 安装

npm:
```bash
$ npm install sx-fetch --save
```

yarn:
```bash
$ yarn add sx-fetch
```

## 使用

初始化：
```js
import fetch from 'sx-fetch';

fetch.init({
    setOptions: (instance) => {
        instance.defaults.baseURL = 'http://localhost:8080/';   // 接口地址
        instance.defaults.timeout = 10000;  // 请求超时时间，默认为10000毫秒
        instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';  // 设置headers，默认设置了post['Content-Type']
        // instance.interceptors  // 拦截请求
    },
    onShowErrorTip: (err, errorTip) => {
        // 请求失败时调用，errorTip 为提示语。
    },
    onShowSuccessTip: (response, successTip) => {
        // 请求成功时调用，successTip 为提示语。
    },
    isMock: (url, data, method, options) => {
        // mock
    },
});
```
`sx-fetch` 0.2.1 版本及以上支持以下写法。
```js
fetch.init({
    baseURL: 'http://localhost:8080/';
    timeout: 10000;
    headers: {
        auth_token: AUTH_TOKEN,
    },
    onShowErrorTip: () => {...},
    onShowSuccessTip: () => {...},
    isMock: () => {...},
});
```
初始化时如果需要配置 `interceptors`，仍需使用 `setOptions` 方法。
###
`instance.interceptors` 请参考 [axios#interceptors](https://github.com/mzabriskie/axios#interceptors) 用法。
默认处理方法如下：
```js
instance.interceptors.request.use(cfg => {
    return cfg;
}, error => {
    return Promise.reject(error);
});

instance.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error);
});
```

###

发送请求：
```js
fetch.get('/user').then(user => {
    console.log(user);
}).catch(err => {
    console.log(err);
}).finally(()  => {
    console.log('请求完成'); // 无论请求成功或失败都会执行。
});
```

###
#### 创建新的fetch实例
>需要 `sx-fetch` 版本 >= 0.2.1

应用中有时需要同时使用不同的fetch配置，例如需要请求多个服务器。这时可以使用 `create` 方法创建新的fetch实例。
##### fetch.create([options])
```js
const instance = fetch.create();
```
新创建的fetch实例 `instance` 的行为与默认的fetch实例完全相同，你可以使用 `init` 方法初始化该实例.
还可以在创建实例的同时传入配置参数。
```js
instance.init({
    baseURL: 'http://localhost:8080',
    ...
})
```
还可以在创建实例的同时传入配置参数。
```js
const instance = fetch.create({
    baseURL: 'http://localhost:8080',
    ...
});
```
###

#### 通过 `defaults` 属性设置fetch实例的配置信息
>需要 `sx-fetch` 版本 >= 0.2.1

```js
fetch.defaults.baseURL = 'http://localhost:8080';
fetch.defaults.timeout = 10000;
fetch.defaults.headers.common['auth_token'] = AUTH_TOKEN;
```
可以给指定实例设置配置信息
```js
const instance = fetch.create();

instance.defaults.baseURL = 'http://localhost:8080';
...
```
mock请求使用 `mockDefaults` 属性来配置。
```js
fetch.mockDefaults.baseURL = 'http://localhost:8080';
...
```

## sx-fetch API

### 请求方法
##### fetch.get(url[, params[, options]])

##### fetch.post(url[, params[, options]])

##### fetch.del(url[, params[, options]])

##### fetch.put(url[, params[, options]])

##### fetch.patch(url[, params[, options]])

##### fetch.singleGet(url[, params[, options]])

| Param | Description | Type | Default |
| --- | --- | --- | --- |
| [url] | 接口地址 | <code>String</code> | / |
| [params] | 请求参数对象（`get` 请求参数会自定追加到url后。） | <code>Object</code> | {} |
| [options] | 配置参数 | <code>Object</code> | {} |
| [options.errorTip] | 请求失败的提示信息 | <code>String</code> \| <code>Boolean</code> | get:  '获取数据失败！'、 post:  '操作失败！' |
| [options.successTip] | 请求成功的提示信息 | <code>String</code> \| <code>Boolean</code> | false |
| [options.timeout] | 请求超时时间（ms） | <code>Number</code> | 10000 |

`options` 详细配置参数参考 [axios#request-config](https://github.com/mzabriskie/axios#request-config);

#### 并发请求
>需要 `sx-fetch` 版本 >= 0.2.1

同时发起多个请求，全部请求完成之后再执行回调。
可以使用 `Promise.all()` 方法，`sx-fetch` 也内置了 `all` 方法。
##### fetch.all(iterable)
```js
const getUser = fetch.get('/user');
const getList = fetch.get('/list');

fetch.all([getUser, getList]).then(([user, list]) => {
    console.log(user, list);
});
```
###

### react 组件装饰器

使用装饰器方法 `inject` 将fetch注入到react组件的props中。当组件销毁时，未完成的请求会被中断。
>注意：注入到react组件内的fetch实例只包含网络请求的方法，不包含其他方法及属性。

##### @fetch.inject([options])

| Param | Description | Type | Default |
| --- | --- | --- | --- |
| [options] |  | <code>Object</code> | {} |
| [options.propName] | 注入props的属性名 | <code>String</code> | $fetch |

```js
import React, {Component} from 'react';
import fetch from 'sx-fetch';

@fetch.inject()
class Comps extends Component {
    getUser() {
        const {$fetch} = this.props;
        $fetch.get('/user').then(user => {
            console.log(user);
        });
    }
    ...
}
```
注入多个fetch实例必须传入 `propName` ，否则props中的fetch实例会被覆盖。
```js
const instance = fetch.create();

@fetch.inject()
@instance.inject({propName: '$instance'})
class Comps extends Component {
    getUser() {
        const {$fetch} = this.props;

        $fetch.get('/user').then(user => {...});
        $instance.get('/user').then(() => {...});
    }
    ...
}
```
