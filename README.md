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
        instance.defaults.baseURL = 'http://localhost:8080/'; // 接口地址
    },
    onShowErrorTip: (err, errorTip) => {
        // 请求失败提示信息的方法
    },
    onShowSuccessTip: (response, successTip) => {
        // 请求成功提示信息的方法
    },
    isMock: (url, data, method, options) => {
        // mock
    },
});
```

发送请求：
```
fetch.get('/user').then(user => {
    console.log(user);
}).then(user => {
    console.log(user);
}).catch(err => {
    console.log(err);
}).finally(()  => {
    console.log('请求完成');
});

```

## sx-fetch API

### 请求方法
fetch.get(url[, params[, options]])

fetch.post(url[, params[, options]])

fetch.del(url[, params[, options]])

fetch.put(url[, params[, options]])

fetch.patch(url[, params[, options]])

fetch.singleGet(url[, params[, options]])

### react 组件装饰器

使用装饰器方法 `inject` 将fetch注入到react组件的props中。当组件销毁时，未完成的请求会被中断。

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
