var LongPollingDeviceChannel = (function () {
    'use strict';

    var LongPollingDeviceChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;

        this._pollParams = {
            executePoll: function (params, continuePollCb) {
                return hive._executeApi(restApi.pollCommands, [params, continuePollCb]);
            },
            resolveTimestamp: function (data) {
                return data.timestamp;
            },
            resolveDataArgs: function (data) {
                return [hive.deviceId, data];
            },
            resolveName: function (data) {
                return data.command;
            },
            resolveDeviceId: function () {
                return hive.deviceId;
            }
        };
    };

    LongPollingDeviceChannel.prototype = LongPollingChannel;
    LongPollingDeviceChannel.constructor = LongPollingDeviceChannel;

    LongPollingDeviceChannel.prototype.sendNotification = function (params, cb) {
        cb = utils.createCallback(cb);
        return this._hive._executeApi(restApi.insertNotification, [params.notification, cb]);
    };

    LongPollingDeviceChannel.prototype.updateCommand = function (cmd, cb) {
        cb = utils.createCallback(cb);
        return this._hive._executeApi(restApi.updateCommand, [cmd.commandId, cmd.command, cb]);
    };

    return LongPollingDeviceChannel;
}());