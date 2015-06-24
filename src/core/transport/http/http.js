var http = (function () {
    'use strict';

    var http = require('http'),
        url = require('url');

    return {
        send: function (params, cb) {
            cb = utils.createCallback(cb);

            var httpParams = url.parse(utils.makeUrl(params), true, true);
            httpParams.headers = params.headers;
            httpParams.method = params.method || 'GET';

            var json = utils.isRequestWithBody(params.method) ? JSON.stringify(params.data) : null;
            if (json) {
                httpParams.headers['Content-Type'] = 'application/json';
                httpParams.headers['Content-Length'] = json.length;
            }

            var request = http.request(httpParams, function (response) {
                var isSuccess = utils.isHttpRequestSuccessfull(response.statusCode),
                    responseText = '';

                response.on('data', function (chunk) {
                    responseText += chunk;
                });

                response.on('end', function () {
                    var responseObj = responseText && JSON.parse(responseText);

                    if (isSuccess) {
                        return cb(null, responseObj);
                    }

                    var cbErrorMessage = utils.serverErrorMessage(responseText, responseObj);

                    var err = {
                        error: cbErrorMessage,
                        request: request,
                        response: response
                    };

                    return cb(err);
                });
            });

            request.on('error', function (err) {
                return cb({
                    error: err && err.message,
                    request: request
                });
            });

            if (json) {
                request.write(json);
            }

            request.end();

            return {
                abort: function () {
                    request.abort();
                }
            };
        }
    };
}());
