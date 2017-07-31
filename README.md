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
```
import fetch from 'sx-fetch';

fetch.init({
    setOptions: (instance) => {
        instance.defaults.baseURL = 'http://localhost:8080/';   // 接口地址
        instance.defaults.timeout = 10000;  // 请求超时时间，默认为10000毫秒
        instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';  // 设置headers，默认只设置了post['Content-Type']
        // instance.defaults.interceptors  // 拦截请求
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
`instance.defaults.interceptors` 请参考 [axios#interceptors](https://github.com/mzabriskie/axios/blob/master/README.md#interceptors) 用法。
###

发送请求：
```
fetch.get('/user').then(user => {
    console.log(user);
}).catch(err => {
    console.log(err);
}).finally(()  => {
    console.log('请求完成'); // 无论请求成功或失败都会执行。
});
```

## sx-fetch API

### 请求方法
##### fetch.get(url[, params[, options]])

##### fetch.post(url[, params[, options]])

##### fetch.del(url[, params[, options]])

##### fetch.put(url[, params[, options]])

##### fetch.patch(url[, params[, options]])

##### fetch.singleGet(url[, params[, options]])

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| [url] | <code>String</code> | 接口地址 | / |
| [params] | <code>Object</code> | 请求参数对象（`get` 请求参数会自定追加到url后。） | {} |
| [options] | <code>Object</code> | 配置参数 | {} |
| [options.errorTip] | <code>String</code> \| <code>Boolean</code> | 请求失败的提示信息 | get:  '获取数据失败！'、 post:  '操作失败！' |
| [options.successTip] | <code>String</code> \| <code>Boolean</code> | 请求成功的提示信息 | false |

### react 组件装饰器

使用装饰器方法 `inject` 将fetch注入到react组件的props中。当组件销毁时，未完成的请求会被中断。

##### @fetch.inject([options])

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | | {} |
| [options.propName] | <code>String</code> | 注入props的属性名 | $fetch |

```
import React, {Component} from 'react';
import fetch from 'sx-fetch';

@fetch.inject()
class Comps extends Component {
    componentDidMount() {
        const {$fetch} = this.props;
        $fetch.get('/user').then(user => {
            console.log(user);
        });
    }
    ......
}
```
