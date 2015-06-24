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
                if (xhr.readyState === 4) {
                    var isSuccess = utils.isHttpRequestSuccessfull(xhr.status),
                        responseObj = xhr.responseText && JSON.parse(xhr.responseText);

                    if (isSuccess) {
                        return cb(null, responseObj);
                    }

                    var cbErrorMessage = utils.serverErrorMessage(xhr.responseText, responseObj);
                    var err = {
                        error: cbErrorMessage,
                        request: xhr
                    };

                    return cb(err);
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
            };
        }
    };
}());
