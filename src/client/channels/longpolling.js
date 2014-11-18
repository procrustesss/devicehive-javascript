var LongPollingClientChannel = (function () {
    'use strict';

    var waitCommandResult = function (hive, deviceId, cmdId, waitTimeout, cb) {
        return hive._executeApi(restApi.waitCommandResult, [deviceId, cmdId, {
            waitTimeout: waitTimeout
        }, cb]);
    };

    var LongPollingClientChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;

        var self = this;
        this._pollParams = {
            executePoll: function (params, continuePollCb) {
                return self._hive._executeApi(restApi.pollManyNotifications, [params, continuePollCb]);
            },
            resolveTimestamp: function (data) {
                return data.notification.timestamp;
            },
            resolveDataArgs: function (data) {
                return [data.deviceGuid, data.notification];
            },
            resolveName: function (data) {
                return data.notification.notification;
            },
            resolveDeviceId: function (data) {
                return data.deviceGuid;
            }
        };
    };

    LongPollingClientChannel.prototype = LongPollingChannel;
    LongPollingClientChannel.constructor = LongPollingClientChannel;

    LongPollingClientChannel.prototype.sendCommand = function (deviceId, cmd, commandInsertedCb) {
        var self = this,
            data = cmd,
            success = utils.noop(),
            waitTimeout,
            isRequestDone = false,
            request = {};

        commandInsertedCb = utils.createCallback(commandInsertedCb);

        function commandResult(id, cb) {
            waitCommandResult(self._hive, deviceId, id, waitTimeout, function (err, res) {
                err = err || (!res && utils.errorMessage('Cannot get command result. Wait request timed out.'));
                if (err) {
                    return cb(err);
                }

                return cb(null, res);
            });
        }

        function onCommandInserted(err, res) {
            err = err
                || (!res && utils.errorMessage('Error inserting a new command'))
                || (!res.id && utils.errorMessage('Cannot get inserted command id'));

            if (err) {
                return commandInsertedCb(err);
            }

            isRequestDone = true;
            request.command = res;

            commandInsertedCb(null, res);
            success && commandResult(request.command.id, success);
        }

        this._hive._executeApi(restApi.insertCommand, [deviceId, data, onCommandInserted]);

        request.result = function (callback, wait) {
            if (wait > 60) {
                throw new Error('Maximum wait timeout for longpolling channel = 60 seconds. Specified timeout - ' + wait);
            }

            waitTimeout = wait;

            if (isRequestDone) {
                commandResult(request.command.id, callback);
            } else {
                success = callback;
            }
        };

        return request;
    };

    return LongPollingClientChannel;
}());