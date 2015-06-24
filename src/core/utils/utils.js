/*
* NOTE! There are a lot of methods which seems to be unnecessary on first sight but
* that's not true. Please consider that there are some javascript environments,
* which does not support ECMA 5 and even some features from ECMA 3.
* A great example is Kinoma JavaScript runtime environment. There are no "setTimeout"
* and "clearTimeout" methods and timeouts are workarounded using certain approaches.
*/

var utils = (function () {
    'use strict';

    var utils = {
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        isFunction: function (val) {
            return Object.prototype.toString.call(val) === '[object Function]';
        },

        isArray: Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isArrayLike: function (arr) {
            return arr != null
                    && arr.length >= 0
                    && arr.length === Math.floor(arr.length);
        },

        isString: function (obj) {
            return Object.prototype.toString.call(obj) === '[object String]';
        },

        isAccessKey: function (val) {
            return val != null && val.length === 44 && new RegExp('^[A-Za-z0-9+/=]*$').test(val);
        },

        inArray: function (val, arr, ind) {
            if (!arr) {
                return;
            }

            if (!utils.isArrayLike(arr)) {
                throw new TypeError('utils.inArray second argument must be an array');
            }

            if (Array.prototype.indexOf && utils.isArray(arr)) {
                return arr.indexOf(val, ind);
            } else {
                var len = arr.length,
                    i = +ind || 0;

                if (!len || (i >= len)) {
                    return -1;
                }

                i = i < 0 ? Math.max(0, len + i) : i;

                for (; i < len; i++) {
                    if (i in arr && arr[i] === val) {
                        return i;
                    }
                }
            }
            return -1;
        },

        map: function (array, mapper) {
            if (!utils.isArrayLike(array)) {
                throw new TypeError(array + ' is not an array');
            }

            if (!utils.isFunction(mapper)) {
                throw new TypeError(mapper + ' is not a function');
            }

            var res = [];
            utils.forEach(array, function (i) {
                res.push(mapper.call(this, i, array));
            });

            return res;
        },

        reduce: function (array, callback /*, initialValue*/) {
            if (!utils.isArrayLike(array)) {
                throw new TypeError(array + ' is not an array');
            }

            if (!utils.isFunction(callback)) {
                throw new TypeError(callback + ' is not a function');
            }

            var t = array, len = t.length >>> 0, k = 0, value;
            if (arguments.length == 3) {
                value = arguments[2];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        },

        forEach: function (obj, callback) {
            if (!obj) {
                return obj;
            }

            if (!utils.isFunction(callback)) {
                throw new TypeError(callback + ' is not a function');
            }

            var i;
            if (utils.isArrayLike(obj)) {
                var len = obj.length;
                for (i = 0; i < len; i++) {
                    if (callback.call(obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        if (callback.call(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        filter: function (obj, func) {
            if (!obj) {
                return obj;
            }

            if (!utils.isFunction(func)) {
                throw new TypeError(func + ' is not a function');
            }

            var res = [];

            utils.forEach(obj, function (i) {
                if (func.call(this, i, obj)) {
                    res.push(this);
                }
            });

            return res;
        },

        // custom to array because some environments do not support Array.prototype.slice.call(arguments)
        toArray: function (args) {
            return utils.filter(args, function () {
                return true;
            });
        },

        find: function (array, func) {
            var res = utils.filter(array, func);
            return res && res.length > 0 ? res[0] : null;
        },

        parseDate: function (date) {
            return new Date(date.substring(0, 4), parseInt(date.substring(5, 7), 10) - 1, date.substring(8, 10),
                date.substring(11, 13), date.substring(14, 16), date.substring(17, 19), date.substring(20, 23));
        },

        formatDate: function (date) {
            if (utils.isString(date))
                return date; // already formatted string - do not modify

            if (Object.prototype.toString.call(date) !== '[object Date]')
                throw new Error('Invalid object type');

            var pad = function (value, length) {
                value = String(value);
                length = length || 2;
                while (value.length < length)
                    value = "0" + value;
                return value;
            };

            return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + "T" +
                pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + "." + pad(date.getUTCMilliseconds(), 3);
        },

        encodeBase64: function (data) {
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
            if (!data) {
                return data;
            }
            do { // pack three octets into four hexets
                o1 = data.charCodeAt(i++);
                o2 = data.charCodeAt(i++);
                o3 = data.charCodeAt(i++);
                bits = o1 << 16 | o2 << 8 | o3;
                h1 = bits >> 18 & 0x3f;
                h2 = bits >> 12 & 0x3f;
                h3 = bits >> 6 & 0x3f;
                h4 = bits & 0x3f;

                // use hexets to index into b64, and append result to encoded string
                tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
            } while (i < data.length);
            enc = tmp_arr.join('');
            var r = data.length % 3;
            return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
        },

        noop: function () {
        },

        createCallback: function (cb) {
            return utils.isFunction(cb) ? cb : utils.noop;
        },

        serializeQuery: function (obj) {
            var str = '',
                key,
                val;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (str !== '') {
                        str += '&';
                    }
                    val = obj[key];
                    val = val === null || val === void 0 ? '' : val;
                    str += encodeURIComponent(key) + '=' + encodeURIComponent(val);
                }
            }
            return str;
        },

        isHttpRequestSuccessfull: function (statusCode){
            return statusCode && statusCode >= 200 && statusCode < 300 || statusCode === 304;
        },

        isRequestWithBody: function (method){
            return method == 'POST' || method == 'PUT';
        },

        makeUrl: function (params) {
            var method = params.method,
                url = params.url,
                data = params.data;

            if (method === 'GET') {
                if (data) {
                    data = utils.serializeQuery(data);
                    data && (url += (url.indexOf('?') != -1 ? '&' : '?') + data);
                }
            }
            return url;
        },

        errorMessage: function (msg) {
            return {error: 'DeviceHive error: ' + msg};
        },

        serverErrorMessage: function (text, json) {
            var msg = text ? ' ' + text : ''
            if (json && (json.message || json.Message))
                msg += ' ' + (json.message || json.Message);

            if (json && json.ExceptionMessage)
                msg += ' ' + json.ExceptionMessage;

            return 'DeviceHive server error' + (msg && ' -' + msg);
        },

        setTimeout: setTimeout,
        clearTimeout: clearTimeout
    };

    return utils;
}());
