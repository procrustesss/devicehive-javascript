var LongPollingChannel = (function () {
    'use strict';

    var setSubKeys = function (sub, subscription, val) {
            utils.forEach(subscription.deviceIds, function () {
                sub.deviceIds[this] = val;
            });

            utils.forEach(subscription.names, function () {
                sub.names[this] = val;
            });
        },
        addSubscription = function (sub, subscription) {
            !subscription.deviceIds && ++sub.allDeviceIds;
            !subscription.names && ++sub.allNames;

            setSubKeys(sub, subscription, true);
        },
        removeSubscription = function (sub, subscription) {
            !subscription.deviceIds && --sub.allDeviceIds;
            !subscription.names && --sub.allNames;

            setSubKeys(sub, subscription, false);
        },
        keysToArray = function (obj) {
            var keys = [];

            utils.forEach(obj, function (i) {
                obj[i] && keys.push(i);
            });

            return keys;
        },
        isSubEmpty = function (sub) {
            return !sub.allDeviceIds && !sub.allNames
                && keysToArray(sub.deviceIds).length === 0 && keysToArray(sub.names).length === 0;
        }, arrayToLowerCase = function (arr) {
            return utils.map(arr, function () {
                return this.toLowerCase();
            });
        };

    // LongPolling channel should maintain 1 global http connection
    // for all subscriptions, because some environments have a limit of maximum parallel http connections
    // check http://stackoverflow.com/a/11185668 for more information related to browser
    var LongPollingChannel = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            this._sub = { deviceIds: {}, allDeviceIds: 0, names: {}, allNames: 0 };

            var pollParams = this._pollParams;
            var self = this;
            this._lp = new LongPolling(this._hive.serviceUrl, {
                executePoll: function (params, continuePollCb) {
                    params.deviceGuids = self._sub.allDeviceIds > 0 ? null : keysToArray(self._sub.deviceIds);
                    params.names = self._sub.allNames > 0 ? null : keysToArray(self._sub.names);

                    return pollParams.executePoll(params, continuePollCb);
                },
                resolveTimestamp: pollParams.resolveTimestamp,
                onData: function (data) {
                    var subs = self.subscriptions,
                        name = pollParams.resolveName(data).toLowerCase(),
                        deviceId = pollParams.resolveDeviceId(data).toLowerCase();

                    var relevantSubscriptions = utils.filter(subs, function () {
                        return (this.names === null || utils.inArray(name, arrayToLowerCase(this.names)) > -1)
                            && (this.deviceIds === null || utils.inArray(deviceId, arrayToLowerCase(this.deviceIds)) > -1);
                    });

                    utils.forEach(relevantSubscriptions, function () {
                        var sub = this;

                        // if error is thrown in the inner callback it will not affect the entire longpolling flow
                        utils.setTimeout(function () {
                            sub._handleMessage.apply(sub, pollParams.resolveDataArgs(data));
                        }, 0);
                    });
                }
            });

            return cb(null);
        },

        close: function (cb) {
            cb = utils.createCallback(cb);

            this._lp.stopPolling();
            return cb(null);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);
            this._lp.stopPolling();

            addSubscription(this._sub, subscription);

            return this._lp.startPolling(cb);
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            removeSubscription(this._sub, subscription);

            this._lp.stopPolling();

            if (isSubEmpty(this._sub)) {
                return cb(null);
            }

            return this._lp.startPolling(cb);
        }
    };

    return LongPollingChannel;
}());
