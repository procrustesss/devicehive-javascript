var WebSocketClientChannel = (function () {
    'use strict';

    var WebSocketClientChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;
        this._events = new Events();
    };

    WebSocketClientChannel.prototype = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            var webSocketUrl = this._hive.serverInfo.webSocketServerUrl;

            if (!webSocketUrl) {
                cb(utils.errorMessage('Open channel failed. Cannot get web socket server url'));
                return;
            }

            var self = this;
            this._wsApi = new WebSocketClientApi();

            self._wsApi._events.bind('command.update', function (msg) {
                var command = msg.command;
                var commandRequest = self._commandRequests[command.id];
                if (commandRequest) {
                    commandRequest._result = command;
                    utils.clearTimeout(commandRequest._timeout);
                    commandRequest._onResult(null, command);
                    delete self._commandRequests[command.id];
                }
            });

            self._wsApi._events.bind('notification.insert', function (notif) {
                var subscription = utils.find(self.subscriptions, function () {
                    return this.id === notif.subscriptionId;
                });

                return subscription && subscription._handleMessage(notif.deviceGuid, notif.notification);
            });

            this._wsApi.open(webSocketUrl, function (err) {
                if (err)
                    return cb(err);

                self._wsApi.authenticate(self._hive.auth.login, self._hive.auth.password, self._hive.auth.accessKey, cb);
            });
        },

        close: function (cb) {
            cb = utils.createCallback(cb);
            this._wsApi.close(cb);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            if (!subscription) {
                return cb(null);
            }

            this._wsApi.notificationSubscribe({
                deviceGuids: subscription.deviceIds,
                names: subscription.names
            }, function (err, res) {
                return cb(err, res && res.subscriptionId);
            });
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.notificationUnSubscribe({ subscriptionId: subscription.id }, cb);
        },

        sendCommand: function (deviceId, cmd, commandInsertedCb) {
            var self = this,
                data = { deviceGuid: deviceId, command: cmd },
                request = {};

            commandInsertedCb = utils.createCallback(commandInsertedCb);

            function onCommandInserted(err, res) {
                if (err) {
                    return commandInsertedCb(err, res);
                }

                if (!res || !res.command || !res.command.id) {
                    return commandInsertedCb(utils.errorMessage('Error inserting a new command'), res)
                }

                self._commandRequests = self._commandRequests || {};
                self._commandRequests[res.command.id] = request;
                commandInsertedCb(null, res);

                request.command = res.command;
            }

            this._wsApi.sendCommand(data, onCommandInserted);

            request._onResult = utils.noop;
            request.result = function (callback, wait) {
                if (request._result)
                    return callback(null, request._result);

                request._onResult = callback;
                request._timeout = utils.setTimeout(function () {
                    var cb = request._onResult;
                    request._onResult = utils.noop;
                    cb(utils.errorMessage('Cannot get command result. Wait request timed out.'));
                }, (wait || 30) * 1000);
            };

            return request;
        }
    };

    return WebSocketClientChannel;
}());
