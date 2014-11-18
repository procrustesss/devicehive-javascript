var http = (function () {
    'use strict';

    var getXhr = utils.noop();

    if (typeof XMLHttpRequest !== 'undefined') {
        getXhr = function () {
            return new XMLHttpRequest();
        };
    } else {
        getXhr = function () {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
                return null;
            }
        };
    }

    if (!getXhr()) {
        throw new Error('DeviceHive: XMLHttpRequest is not available');
    }

    return {
        send: function (params, cb) {
            params.method = params.method || 'GET';
            cb = utils.createCallback(cb);

            var xhr = getXhr(),
                headers = params.headers,
                url = utils.makeUrl(params),
                method = params.method;

            xhr.open(method, url, true);

            if (method == 'POST' || method == 'PUT') {
                xhr.setRequestHeader('Content-Type', 'application/json');
                params.data = JSON.stringify(params.data);
            }

            xhr.onreadystatechange = function () {
                var isSuccess, err;

                if (xhr.readyState === 4) {

                    isSuccess = xhr.status && xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;
                    if (!isSuccess) {
                        err = utils.serverErrorMessage(xhr);
                    }

                    var result = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                    return cb(err, result);
                }
            };

            if (headers) {
                utils.forEach(headers, function (key) {
                    xhr.setRequestHeader(key, this);
                });
            }

            xhr.send(params.data || void 0);

            return {
                abort: function () {
                    xhr.abort();
                }
            }
        }
    }
}());