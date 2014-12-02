var WebSocketTransport = (function () {
    'use strict';

    var WebSocketTransport = utils.noop;

    WebSocketTransport.requestTimeout = 10000;

    WebSocketTransport.prototype = {
        _handler: utils.noop,

        open: function (url, cb, WebSocketRfc) {
            cb = utils.createCallback(cb);

            var notSupportedErr = utils.errorMessage('WebSockets are not supported');
            try {
                WebSocket = WebSocket || WebSocketRfc;
                if (!WebSocket) {
                    return cb(notSupportedErr);
                }
            } catch (e){
                return cb(notSupportedErr);
            }

            var self = this;
            var opened = false;

            this._native = new WebSocket(url);

            this._native.onopen = function (e) {
                opened = true;
                cb(null, e);
            };

            this._native.onmessage = function (e) {
                var response = JSON.parse(e.data);

                if (self._requests && response.requestId) {
                    var request = self._requests[response.requestId];
                    if (request) {
                        utils.clearTimeout(request.timeout);
                        if (response.status && response.status == 'success') {
                            request.cb(null, response);
                        }
                        else {
                            request.cb({error: response.error});
                        }
                        delete self._requests[response.requestId];
                    }
                }
                else {
                    self._handler(response);
                }
            };

            this._native.onclose = function (e) {
                if (!opened) {
                    var err = utils.errorMessage('WebSocket connection has failed to open');
                    err.data = e;
                    return cb(err);
                }
            };
        },

        close: function (cb) {
            cb = utils.createCallback(cb);

            this._native.onclose = function (e) {
                return cb(null, e);
            };

            this._native.close();
        },

        message: function (cb) {
            this._handler = cb;
        },

        send: function (action, data, cb) {
            cb = utils.createCallback(cb);

            var self = this,
                request = {};

            this._requestId = this._requestId || 0;
            request.id = ++this._requestId;
            //callback for request
            request.cb = cb;
            request.timeout = utils.setTimeout(function () {
                request.cb(utils.errorMessage('Operation timeout'));
                delete self._requests[request.id];
            }, WebSocketTransport.requestTimeout);

            this._requests = this._requests || {};
            this._requests[request.id] = request;

            data = data || {};
            data.requestId = request.id;
            data.action = action;
            this._native.send(JSON.stringify(data));

            return request;
        }
    };

    return WebSocketTransport;
}());
