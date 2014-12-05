var WebSocketDeviceApi = (function () {
    'use strict';

    var WebSocketDeviceApi = function () {
        var events = new Events();
        this._events = events;
        this._transport = new WebSocketTransport();
        this._transport.message(function (response) {
            if (response.action == 'command/insert' && response.command && response.command.id) {
                events.trigger('command.insert', response);
            }
        });
    };

    WebSocketDeviceApi.prototype = {
        open: function (baseUrl, cb) {
            return this._transport.open(baseUrl + '/device', cb);
        },
        close: function (cb) {
            return this._transport.close(cb);
        },

        getInfo: function (cb) {
            this._transport.send('server/info', null, cb);
        },

        authenticate: function (deviceId, deviceKey, cb) {
            this._transport.send('authenticate', {
                deviceId: deviceId,
                deviceKey: deviceKey
            }, cb);
        },

        updateCommand: function (params, cb) {
            this._transport.send('command/update', params, cb);
        },
        commandSubscribe: function (params, cb) {
            this._transport.send('command/subscribe', params, cb);
        },
        commandUnSubscribe: function (params, cb) {
            this._transport.send('command/unsubscribe', params, cb);
        },

        sendNotification: function (params, cb) {
            this._transport.send('notification/insert', params, cb);
        }
    };

    return WebSocketDeviceApi;
}());
