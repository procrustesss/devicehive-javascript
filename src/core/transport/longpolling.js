var LongPolling = (function () {
    'use strict';

    var poll = function (self, timestamp) {
        var params = { timestamp: timestamp };

        var continuePollingCb = function (err, res) {
            if (!err) {
                var lastTimestamp = null;
                if (res) {
                    utils.forEach(res, function () {
                        var newTimestamp = self._poller.resolveTimestamp(this);
                        if (!lastTimestamp || newTimestamp > lastTimestamp) {
                            lastTimestamp = newTimestamp;
                        }

                        self._poller.onData(this);
                    });
                }

                poll(self, lastTimestamp || timestamp);
            } else {
                if (self._polling) {
                    // Polling unexpectedly stopped probably connection was lost. Try reconnect in 1 second
                    utils.setTimeout(function () {
                        poll(self, timestamp);
                    }, 1000);
                }
            }
        };

        self._request = self._polling && self._poller.executePoll(params, continuePollingCb);
    };

    var LongPolling = function (serviceUrl, poller) {
        this.serviceUrl = serviceUrl;
        this._poller = poller
    };

    LongPolling.prototype = {
        startPolling: function (cb) {
            cb = utils.createCallback(cb);

            this._polling = true;

            var self = this;
            return this._request = restApi.info(this.serviceUrl, function (err, res) {
                if (err){
                    var wasPolling = self._polling;
                    self._polling = false;
                    return cb(wasPolling ? err : null);
                }

                poll(self, res.serverTimestamp);
                return cb(null);
            });
        },

        stopPolling: function () {
            this._polling = false;
            this._request && this._request.abort();
        }
    };

    return LongPolling;
}());