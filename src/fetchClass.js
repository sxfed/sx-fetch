/**
 * 基于[axios]{@link https://github.com/mzabriskie/axios}进行封装的ajax工具
 * @example
 * // 引入
 * import * as fetch from 'path/to/promise-ajax';
 *
 * @example
 * // 在项目的入口文件，根据项目需求，进行初始化
 * promiseAjax.init({
 *     setOptions(instance, isMock) {...},
 *     onShowErrorTip(err, errorTip) {...},
 *     onShowSuccessTip(response, successTip) {...},
 *     isMock(url, data, method, options) {...},
 * })
 *
 * @example
 * // 发起get请求
 * this.setState({loading: true}); // 开始显示loading
 * const getAjax = promiseAjax.get('/users', {pageNum: 1, pageSize: 10});
 * getAjax.then(res => console.log(res))
 * .catch(err => console.log(err))
 * .finally(() => {
 *     this.setState({loading: false}); // 结束loading
 * });
 *
 * // 可以打断请求
 * getAjax.cancel();
 *
 * @module ajax工具
 * */

import axios from 'axios';
import './utils/promise-extends'; // 扩展了 done 和 finally 方法
import {mosaicUrl} from './utils/url-utils';
import fetchInject from './fetchDecorator';

export default class SxFetch {
    constructor() {
        /**
         * mockjs 使用的实例，可以与真实ajax请求实例区分开，
         * 用于正常请求和mock同时使用时，好区分；
         * 初始化init方法，通过isMock(url, data, method, options)函数，区分哪些请求需要mock，
         * 比如：url以约定'/mock'开头的请求，使用mock等方式。
         *
         * @example
         * // 配合mock使用
         * import MockAdapter from 'axios-mock-adapter';
         * import {mockInstance} from 'path/to/promise-ajax';
         * const mock = new MockAdapter(mockInstance);
         * mock.onGet('/success').reply(200, {
         *     msg: 'success',
         * });
         */
        this.axiosInstance = axios.create();
        this.mockInstance = axios.create();
        SxFetch._setOptions(this.axiosInstance);
        SxFetch._setOptions(this.mockInstance);

        this.defaults = this.axiosInstance.defaults;
        this.mockDefaults = this.mockInstance.defaults;
    }

    /**
     * 创建新的fetch实例，同时调用init方法初始化fetch配置。
     * @param  {Object} options 初始化配置
     * @return {SxFetch}  新的fetch实例
     */
    create(options = {}) {
        const instance = new SxFetch();
        instance.init(options);
        return instance;
    }

    _onShowErrorTip() {}

    _onShowSuccessTip() {}

    _isMock() {}

    static _setOptions(axiosInstance) {
        axiosInstance.defaults.timeout = 10000;
        axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        axiosInstance.defaults.baseURL = '/';
        // Add a request interceptor
        axiosInstance.interceptors.request.use(cfg => {
            // Do something before request is sent
            return cfg;
        }, error => {
            // Do something with request error
            return Promise.reject(error);
        });

        // Add a response interceptor
        axiosInstance.interceptors.response.use(response => {
            // Do something with response data
            return response;
        }, error => {
            // Do something with response error
            return Promise.reject(error);
        });
    }

    /**
     * 初始化promiseAjax，接受一个options参数，options的具体参数如下：
     *
     * @param {function} setOptions setOptions(instance[, isMock]){...} 设置axios实例属性，如果isMock为true，为mockInstance
     * @param {function} onShowErrorTip onShowErrorTip(err, errorTip){...} 如何显示errorTip
     * @param {function} onShowSuccessTip onShowSuccessTip(response, successTip){...} 如何显示successTip
     * @param {function} isMock isMock(url, data, method, options){...} 判断请求是否为mock请求
     */
    init({
        setOptions = (/* instance, isMock */) => {},
        onShowErrorTip = (/* err, errorTip */) => {},
        onShowSuccessTip = (/* response, successTip */) => {},
        isMock = (/* url, data, method, options */) => {},
        headers = {},
        ...otherOptions,
    }) {
        setOptions(this.axiosInstance);
        setOptions(this.mockInstance, true); // isMock
        this._onShowErrorTip = onShowErrorTip;
        this._onShowSuccessTip = onShowSuccessTip;
        this._isMock = isMock;

        // 将其他axios配置添加到axios实例中。
        Object.keys(otherOptions).map(optKey => {
            this.axiosInstance.defaults[optKey] = otherOptions[optKey];
            this.mockInstance.defaults[optKey] = otherOptions[optKey];
        });

        // 将请求头配置添加到axios实例中。
        Object.keys(headers).map(headerKey => {
            this.axiosInstance.defaults.headers[headerKey] = headers[headerKey];
            this.mockInstance.defaults.headers[headerKey] = headers[headerKey];
        });
    }

    fetch(url, data, method = 'get', options = {}) {
        let {successTip = false, errorTip = method === 'get' ? '获取数据失败！' : '操作失败！'} = options;
        const CancelToken = axios.CancelToken;
        let cancel;
        const isGet = method === 'get';
        const isMock = this._isMock(url, data, method, options);
        let axiosInstance = this.axiosInstance;

        if (isGet && !isMock) {
            url = mosaicUrl(url, data);
        }
        if (isMock) {
            axiosInstance = this.mockInstance;
            axiosInstance.defaults.baseURL = '/';
        }
        const fetchPromise = new Promise((resolve, reject) => {
            axiosInstance({
                method,
                url,
                data,
                cancelToken: new CancelToken(c => cancel = c),
                ...options,
            }).then(response => {
                this._onShowSuccessTip(response, successTip);
                resolve(response.data);
            }, err => {
                const isCanceled = err && err.message && err.message.canceled;
                if (isCanceled) return; // 如果是用户主动cancel，不做任何处理，不会触发任何函数
                this._onShowErrorTip(err, errorTip);
                reject(err);
            }).catch(error => {
                reject(error);
            });
        });
        fetchPromise.cancel = function () {
            cancel({
                canceled: true,
            });
        };
        return fetchPromise;
    }

    /**
     * 发送一个get请求，一般用于查询操作
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据，正常请求会转换成query string 拼接到url后面
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    get(url, params, options) {
        return this.fetch(url, params, 'get', options);
    }

    /**
     * 发送一个post请求，一般用于添加操作
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    post(url, params, options) {
        return this.fetch(url, params, 'post', options);
    }


    /**
     * 发送一个put请求，一般用于更新操作
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    put(url, params, options) {
        return this.fetch(url, params, 'put', options);
    }

    /**
     * 发送一个patch请求，一般用于更新部分数据
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    patch(url, params, options) {
        return this.fetch(url, params, 'patch', options);
    }

    /**
     * 发送一个delete请求，一般用于删除数据，params会被忽略（http协议中定义的）
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    del(url, params, options) {
        return this.fetch(url, params, 'delete', options);
    }

    singleGets = {};
    /**
     * 发送新的相同url的get请求，历史未结束相同url请求就会被打断，同一个url请求，最终只会触发一次
     * 用于输入框，根据输入远程获取提示等场景
     *
     * @param {string} url 请求路径
     * @param {object} [params] 传输给后端的数据
     * @param {object} [options] axios 配置参数
     * @returns {Promise}
     */
    singleGet(url, params, options) {
        const oldFetch = this.singleGets[url];
        if (oldFetch) {
            oldFetch.cancel();
        }
        const singleFetch = this.fetch(url, params, 'get', options);
        this.singleGets[url] = singleFetch;
        return singleFetch;
    }

    /**
     * 并发请求方法
     * @param  {Array} args fetch 请求数组
     * @return {Promise}
     */
    all(args) {
        return Promise.all(args);
    }

    /**
     * 装饰器方法
     * @type {function}
     */
    inject = fetchInject;
}
