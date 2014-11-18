var WebSocketDeviceChannel = (function () {
    'use strict';

    var WebSocketDeviceChannel = function (hive) {
        this.subscriptions = [];
        this.compatibilityMode = !hive.auth.accessKey;

        this._hive = hive;
    };

    WebSocketDeviceChannel.prototype = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            var webSocketUrl = this._hive.serverInfo.webSocketServerUrl;

            if (!webSocketUrl) {
                cb(utils.errorMessage('Open channel failed. Cannot get web socket server url'));
                return;
            }

            var self = this;

            this._wsApi = this.compatibilityMode
                ? new WebSocketDeviceApi()
                : new WebSocketClientApi();

            this._wsApi._events.bind('onCommandInsert', function (cmd) {
                var subscriptionsToHandle = self.subscriptions;

                if(!self.compatibilityMode){
                    subscriptionsToHandle = utils.find(self.subscriptions, function () {
                        return this.id === cmd.subscriptionId;
                    });
                    subscriptionsToHandle = [subscriptionsToHandle];
                }

                utils.forEach(subscriptionsToHandle, function(){
                    this._handleMessage(self._hive.deviceId, cmd.command);
                });
            });

            this._wsApi.open(webSocketUrl, function onOpen(err) {
                if (err)
                    return cb(err);

                if (self._hive.auth.accessKey) {
                    self._wsApi.authenticate(null, null, self._hive.auth.accessKey, cb);
                } else {
                    self._wsApi.authenticate(self._hive.auth.deviceId, self._hive.auth.deviceKey, cb);
                }
            });
        },

        close: function (cb) {
            cb = utils.createCallback(cb);
            this._wsApi.close(cb);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            if(subscription.names && this.compatibilityMode){
                throw new Error('Command name filtering is not supported for deviceKey authentication and websocket channel. Note: device key auth is deprecated, use access key auth instead.')
            }

            if (!subscription) {
                return cb(null);
            }

            if(this.compatibilityMode && this.subscriptions.length > 1){
                return cb(null);
            }

            this._wsApi.commandSubscribe(this.compatibilityMode ? null : {
                deviceGuids: subscription.deviceIds,
                names: subscription.names
            }, function (err, res) {
                return cb(err, res && res.subscriptionId);
            });
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            // in compatibility mode if there are more than 1 subscription
            // do not unsubscribe from messages
            if(this.compatibilityMode && this.subscriptions.length > 1){
                return cb(null);
            }

            this._wsApi.commandUnSubscribe({ subscriptionId: subscription.id }, cb);
        },

        sendNotification: function (params, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.sendNotification(params, cb);
        },

        updateCommand: function (cmd, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.updateCommand(cmd, cb);
        }
    };

    return WebSocketDeviceChannel;
}());