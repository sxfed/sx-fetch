'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mockInstance = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * 基于[axios]{@link https://github.com/mzabriskie/axios}进行封装的ajax工具
                                                                                                                                                                                                                                                                   * @example
                                                                                                                                                                                                                                                                   * // 引入
                                                                                                                                                                                                                                                                   * import * as promiseAjax from 'path/to/promise-ajax';
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

// 扩展了 done 和 finally 方法


exports.init = init;
exports.get = get;
exports.post = post;
exports.put = put;
exports.patch = patch;
exports.del = del;
exports.singleGet = singleGet;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

require('./promise-extends');

var _urlUtils = require('./utils/url-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instance = _axios2.default.create();

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
var mockInstance = exports.mockInstance = _axios2.default.create();

var _onShowErrorTip = function _onShowErrorTip() {};
var _onShowSuccessTip = function _onShowSuccessTip() {};
var _isMock = function _isMock() {};

/**
 * 初始化promiseAjax，接受一个options参数，options的具体参数如下：
 *
 * @param {function} setOptions setOptions(instance[, isMock]){...} 设置axios实例属性，如果isMock为true，为mockInstance
 * @param {function} onShowErrorTip onShowErrorTip(err, errorTip){...} 如何显示errorTip
 * @param {function} onShowSuccessTip onShowSuccessTip(response, successTip){...} 如何显示successTip
 * @param {function} isMock isMock(url, data, method, options){...} 判断请求是否为mock请求
 */
function init(_ref) {
    var _ref$setOptions = _ref.setOptions,
        setOptions = _ref$setOptions === undefined ? function () /* instance, isMock */{} : _ref$setOptions,
        _ref$onShowErrorTip = _ref.onShowErrorTip,
        onShowErrorTip = _ref$onShowErrorTip === undefined ? function () /* err, errorTip */{} : _ref$onShowErrorTip,
        _ref$onShowSuccessTip = _ref.onShowSuccessTip,
        onShowSuccessTip = _ref$onShowSuccessTip === undefined ? function () /* response, successTip */{} : _ref$onShowSuccessTip,
        _ref$isMock = _ref.isMock,
        isMock = _ref$isMock === undefined ? function () /* url, data, method, options */{} : _ref$isMock;

    setOptions(instance);
    setOptions(mockInstance, true); // isMock
    _onShowErrorTip = onShowErrorTip;
    _onShowSuccessTip = onShowSuccessTip;
    _isMock = isMock;
}

function _setOptions(axiosInstance) {
    axiosInstance.defaults.timeout = 10000;
    axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    axiosInstance.defaults.baseURL = '/';
    // Add a request interceptor
    axiosInstance.interceptors.request.use(function (cfg) {
        // Do something before request is sent
        return cfg;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });

    // Add a response interceptor
    axiosInstance.interceptors.response.use(function (response) {
        // Do something with response data
        return response;
    }, function (error) {
        // Do something with response error
        return Promise.reject(error);
    });
}

_setOptions(instance);
_setOptions(mockInstance);

function fetch(url, data) {
    var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var _options$successTip = options.successTip,
        successTip = _options$successTip === undefined ? false : _options$successTip,
        _options$errorTip = options.errorTip,
        errorTip = _options$errorTip === undefined ? method === 'get' ? '获取数据失败！' : '操作失败！' : _options$errorTip;

    var CancelToken = _axios2.default.CancelToken;
    var cancel = void 0;
    var isGet = method === 'get';
    var isMock = _isMock(url, data, method, options);
    var axiosInstance = instance;

    if (isGet && !isMock) {
        url = (0, _urlUtils.mosaicUrl)(url, data);
    }
    if (isMock) {
        axiosInstance = mockInstance;
        axiosInstance.defaults.baseURL = '/';
    }
    var fetchPromise = new Promise(function (resolve, reject) {
        axiosInstance(_extends({
            method: method,
            url: url,
            data: data,
            cancelToken: new CancelToken(function (c) {
                return cancel = c;
            })
        }, options)).then(function (response) {
            _onShowSuccessTip(response, successTip);
            resolve(response.data);
        }, function (err) {
            var isCanceled = err && err.message && err.message.canceled;
            if (isCanceled) return; // 如果是用户主动cancel，不做任何处理，不会触发任何函数
            _onShowErrorTip(err, errorTip);
            reject(err);
        }).catch(function (error) {
            reject(error);
        });
    });
    fetchPromise.cancel = function () {
        cancel({
            canceled: true
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
function get(url, params, options) {
    return fetch(url, params, 'get', options);
}

/**
 * 发送一个post请求，一般用于添加操作
 * @param {string} url 请求路径
 * @param {object} [params] 传输给后端的数据
 * @param {object} [options] axios 配置参数
 * @returns {Promise}
 */
function post(url, params, options) {
    return fetch(url, params, 'post', options);
}

/**
 * 发送一个put请求，一般用于更新操作
 * @param {string} url 请求路径
 * @param {object} [params] 传输给后端的数据
 * @param {object} [options] axios 配置参数
 * @returns {Promise}
 */
function put(url, params, options) {
    return fetch(url, params, 'put', options);
}

/**
 * 发送一个patch请求，一般用于更新部分数据
 * @param {string} url 请求路径
 * @param {object} [params] 传输给后端的数据
 * @param {object} [options] axios 配置参数
 * @returns {Promise}
 */
function patch(url, params, options) {
    return fetch(url, params, 'patch', options);
}

/**
 * 发送一个delete请求，一般用于删除数据，params会被忽略（http协议中定义的）
 * @param {string} url 请求路径
 * @param {object} [params] 传输给后端的数据
 * @param {object} [options] axios 配置参数
 * @returns {Promise}
 */
function del(url, params, options) {
    return fetch(url, params, 'delete', options);
}

var singleGets = {};
/**
 * 发送新的相同url的get请求，历史未结束相同url请求就会被打断，同一个url请求，最终只会触发一次
 * 用于输入框，根据输入远程获取提示等场景
 *
 * @param {string} url 请求路径
 * @param {object} [params] 传输给后端的数据
 * @param {object} [options] axios 配置参数
 * @returns {Promise}
 */
function singleGet(url, params, options) {
    var oldFetch = singleGets[url];
    if (oldFetch) {
        oldFetch.cancel();
    }
    var singleFetch = fetch(url, params, 'get', options);
    singleGets[url] = singleFetch;
    return singleFetch;
}