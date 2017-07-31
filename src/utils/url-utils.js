/**
 * 拼接get请求所需url
 * @param {string} url
 * @param {object} params 请求参数
 * @returns {string} 拼接后的url
 */
export function mosaicUrl(url, params) {
    if (!params) return url;
    const queryString = [];
    Object.keys(params).forEach(key => {
        let value = params[key];
        if (value !== undefined && value !== null) {
            queryString.push(`${key}=${value}`);
        }
    });
    const qStr = queryString.join('&');
    if (url.indexOf('?') < 0) {
        url += `?${qStr}`;
    } else if (url.endsWith('&')) {
        url += qStr;
    } else if (url.endsWith('?')) {
        url += `${qStr}`;
    } else {
        url += `&${qStr}`;
    }
    return url;
}
