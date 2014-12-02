(function () {
    'use strict';

    var ws = require('ws');

    var oldOpen = WebSocketTransport.prototype.open;

    WebSocketTransport.prototype.open = function (url, cb) {
        return oldOpen.call(this, url, cb, ws);
    };
}());
