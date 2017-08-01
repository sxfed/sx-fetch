'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _promiseAjax = require('./promise-ajax');

var promiseFetch = _interopRequireWildcard(_promiseAjax);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

function ajax() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$propName = _ref.propName,
        propName = _ref$propName === undefined ? '$fetch' : _ref$propName;

    return function (WrappedComponent) {
        var WithSubscription = function (_Component) {
            _inherits(WithSubscription, _Component);

            function WithSubscription(props) {
                _classCallCheck(this, WithSubscription);

                var _this = _possibleConstructorReturn(this, (WithSubscription.__proto__ || Object.getPrototypeOf(WithSubscription)).call(this, props));

                _this[propName] = {};
                _this._$ajaxTokens = [];
                var ajaxMethods = ['get', 'post', 'put', 'patch', 'del', 'singleGet'];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    var _loop = function _loop() {
                        var method = _step.value;

                        _this[propName][method] = function () {
                            var ajaxToken = promiseFetch[method].apply(promiseFetch, arguments);
                            _this._$ajaxTokens.push(ajaxToken);
                            return ajaxToken;
                        };
                    };

                    for (var _iterator = ajaxMethods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        _loop();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return _this;
            }

            _createClass(WithSubscription, [{
                key: 'componentWillUnmount',
                value: function componentWillUnmount() {
                    var _$ajaxTokens = this._$ajaxTokens;
                    _$ajaxTokens.forEach(function (item) {
                        return item.cancel();
                    });
                }
            }, {
                key: 'render',
                value: function render() {
                    var ajaxProp = this[propName];
                    var injectProps = _defineProperty({}, propName, ajaxProp);
                    return _react2.default.createElement(WrappedComponent, _extends({}, injectProps, this.props));
                }
            }]);

            return WithSubscription;
        }(_react.Component);

        /* 讲原组件的所有非react属性绑定新组件中 */


        WithSubscription.displayName = 'WithSubscription(' + (WrappedComponent.displayName || WrappedComponent.name || 'Component') + ')';
        (0, _hoistNonReactStatics2.default)(WithSubscription, WrappedComponent);

        return WithSubscription;
    };
}

exports.default = ajax;