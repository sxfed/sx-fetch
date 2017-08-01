import React, {Component} from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

import * as promiseFetch from './promise-ajax';

/**
 * 将$ajax属性注入到目标组件props中，目标组件可以通过this.props.$ajax.get(...)方式进行使用;
 * 每次发送请求时，保存了请求的句柄，在componentWillUnmount方法中，进行统一cancel，进行资源释放，防止组件卸载之后，ajax回调还能执行引起的bug。
 * @example
 * // 装饰器方式：
 * // @ajax()
 * // class SomeComponent extends Component {...}
 *
 * // 传递参数，修改注入的props属性
 * // @ajax({propName = 'ajax001'}) // 组件内调用：this.props.ajax001
 * // class SomeComponent extends Component {...}
 *
 * @example
 * // 直接使用
 * const WrappedComponet = ajax()(SomeComponent);
 *
 * @module ajax高阶组件
 */

function ajax({propName = '$fetch'} = {}) {
    return function (WrappedComponent) {
        class WithSubscription extends Component {
            constructor(props) {
                super(props);
                this[propName] = {};
                this._$ajaxTokens = [];
                const ajaxMethods = ['get', 'post', 'put', 'patch', 'del', 'singleGet'];

                for (let method of ajaxMethods) {
                    this[propName][method] = (...args) => {
                        const ajaxToken = promiseFetch[method](...args);
                        this._$ajaxTokens.push(ajaxToken);
                        return ajaxToken;
                    };
                }
            }

            static displayName = `WithSubscription(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

            componentWillUnmount() {
                const _$ajaxTokens = this._$ajaxTokens;
                _$ajaxTokens.forEach(item => item.cancel());
            }

            render() {
                const ajaxProp = this[propName];
                const injectProps = {
                    [propName]: ajaxProp,
                };
                return <WrappedComponent {...injectProps} {...this.props}/>;
            }
        }

        /* 讲原组件的所有非react属性绑定新组件中 */
        hoistNonReactStatic(WithSubscription, WrappedComponent);

        return WithSubscription;
    };
}

export default ajax;
