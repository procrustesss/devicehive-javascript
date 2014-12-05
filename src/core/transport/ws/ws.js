(function () {
    'use strict';

    var ws = require('ws');

    var WebSocket = function (url) {
        ws.call(this, url, {
            origin: 'http://origin'
        });
    };

    WebSocket.constructor = ws.constructor;
    WebSocket.prototype = ws.prototype;

    WebSocketTransport.prototype.WebSocket = WebSocket;
}());
