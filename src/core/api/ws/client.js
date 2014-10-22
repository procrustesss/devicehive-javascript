var WebSocketClientApi = (function () {
    'use strict';

    var WebSocketClientApi = function () {
        var events = new Events();
        this._events = events;
        this._transport = new WebSocketTransport();
        this._transport.message(function (response) {
            if (response.action == 'command/insert' && response.command && response.command.id) {
                events.trigger('onCommandInsert', response);
            }

            if (response.action == 'command/update') {
                events.trigger('onCommandUpdate', response);
            }

            if (response.action == 'notification/insert' && response.deviceGuid && response.notification) {
                events.trigger('onNotificationInsert', response);
            }
        });
    };

    WebSocketClientApi.prototype = {
        open: function (baseUrl, cb) {
            this._transport.open(baseUrl + '/client', cb);
        },
        close: function (cb) {
            this._transport.close(cb);
        },

        getInfo: function (cb) {
            this._transport.send('server/info', null, cb);
        },

        authenticate: function (username, password, key, cb) {
            this._transport.send('authenticate', {
                login: username,
                password: password,
                accessKey: key
            }, cb);
        },

        sendCommand: function (params, cb) {
            this._transport.send('command/insert', params, cb);
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
        },
        notificationSubscribe: function (params, cb) {
            this._transport.send('notification/subscribe', params, cb);
        },
        notificationUnSubscribe: function (params, cb) {
            this._transport.send('notification/unsubscribe', params, cb);
        }
    };

    return WebSocketClientApi;
}());