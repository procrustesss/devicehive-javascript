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

            var dataInBody = isRequestWithBody();
            if (dataInBody) {
                httpParams.headers['Content-Type'] = 'application/json';
            }

            var request = http.request(httpParams, function (response) {
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    var parsed = body && JSON.parse(body);
                    return cb(null, parsed);
                });
            });

            request.on('error', function (err) {
                err = utils.serverErrorMessage(err);
                return cb(err);
            });

            if (dataInBody) {
                request.wite(JSON.stringify(params.data));
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
