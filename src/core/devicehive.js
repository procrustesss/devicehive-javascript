/**
 * @module Core
 */
var DeviceHive = (function () {
    'use strict';

    var changeChannelState = function (self, newState, oldState) {
            oldState = oldState || self.channelState;
            if (oldState === self.channelState) {
                self.channelState = newState;
                self._events.trigger('channel.state.changed', { oldState: oldState, newState: newState });
                return true;
            }
            return false;
        },
        findSubscription = function (channel, id) {
            return utils.find(channel.subscriptions, function () {
                return this.id === id;
            });
        },
        removeSubscription = function (channel, subscription) {
            var index = channel.subscriptions.indexOf(subscription);
            channel.subscriptions.splice(index, 1);
            subscription._changeState(Subscription.states.unsubscribed);
        };

    /**
     * DeviceHive channel states
     * @readonly
     * @enum {number}
     * @memberof module:Core~DeviceHive
     */
    var channelStates = {
        /** channel is not connected */
        disconnected: 0,
        /** channel is being connected */
        connecting: 1,
        /** channel is connected */
        connected: 2
    };

    /**
     * @callback DeviceHive~openChannelCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} channel - A name of the opened channel
     */

    /**
     * @typedef {Object} DeviceHive~State
     * @property {Number} oldState - previous state
     * @property {Number} newState - current state
     */

    /**
     * @callback DeviceHive~channelStateChangedCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {State} state - A channel state object
     */

    /**
     * @callback DeviceHive~subscribeCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {module:Core~Subscription} subscription - added subscription object
     */

    /**
     * @callback DeviceHive~unsubscribeCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {module:Core~Subscription} subscription - removed subscription object
     */

    /**
     * @typedef {Object} DeviceHive~SubscribeParameters
     * @property {function} onMessage - a callback that will be invoked when a message is received
     * @property {(Array | String)} deviceIds - single device identifier, array of identifiers or null (subscribe to all devices)
     * @property {(Array | String)} names - notification name, array of notifications or null (subscribe to all notifications)
     */

    /**
     * Core DeviceHive class
     *
     * @mixin DeviceHive
     * @memberof module:Core
     * @inner
     */
    var DeviceHive = function (){
        /**
         * Current channel state
         */
        this.channelState = channelStates.disconnected;
        this._events = new Events();
    };

    DeviceHive.prototype = {
        channelStates: channelStates,

        /**
         * Opens the first compatible communication channel to the server
         *
         * @memberof module:Core~DeviceHive
         * @param {DeviceHive~openChannelCb} cb - The callback that handles the response
         * @param {(Array | String)} [channels = null] - Channel names to open. Default supported channels: 'websocket', 'longpolling'
         */
        openChannel: function (cb, channels) {
            cb = utils.createCallback(cb);

            if (!changeChannelState(this, this.channelStates.connecting, this.channelStates.disconnected)) {
                cb(null);
                return;
            }

            var self = this;

            function manageInfo(info) {
                self.serverInfo = info;

                if (!channels) {
                    channels = [];
                    utils.forEach(self._channels, function (t) {
                        channels.push(t);
                    });
                }
                else if (!utils.isArray(channels)) {
                    channels = [channels];
                }

                var emptyChannel = true;

                (function checkChannel(channels) {
                    utils.forEach(channels, function (ind) { // enumerate all channels in order
                        var channel = this;
                        if (self._channels[channel]) {
                            self.channel = new self._channels[channel](self);
                            self.channel.open(function (err) {
                                if (err) {
                                    var channelsToCheck = channels.slice(++ind);
                                    if (!channelsToCheck.length)
                                        return cb(utils.errorMessage('Cannot open any of the specified channels'));
                                    checkChannel(channelsToCheck);
                                } else {
                                    changeChannelState(self, self.channelStates.connected);
                                    cb(null, channel);
                                }
                            });

                            return emptyChannel = false;
                        }
                    });
                })(channels);

                emptyChannel && cb(utils.errorMessage('None of the specified channels are supported'));
            }

            if (this.serverInfo) {
                manageInfo(this.serverInfo);
            } else {
                restApi.info(this.serviceUrl, function (err, res) {
                    if (!err) {
                        manageInfo(res);
                    } else {
                        changeChannelState(self, self.channelStates.disconnected);
                        cb(err, res);
                    }
                });
            }
        },

        /**
         * Closes the communications channel to the server
         *
         * @memberof module:Core~DeviceHive
         * @param {module:Core~noDataCallback} cb - The callback that handles the response
         */
        closeChannel: function (cb) {
            cb = utils.createCallback(cb);

            if (this.channelState === this.channelStates.disconnected)
                return cb(null);

            var self = this;
            if (this.channel) {
                this.channel.close(function (err, res) {
                    if (err) {
                        return cb(err, res);
                    }

                    utils.forEach(utils.toArray(self.channel.subscriptions), function () {
                        removeSubscription(self.channel, this);
                    });

                    self.channel = null;

                    changeChannelState(self, self.channelStates.disconnected);
                    return cb(null);
                });
            }
        },

        /**
         * Adds a callback that will be invoked when the communication channel state is changed
         *
         * @memberof module:Core~DeviceHive
         * @param {DeviceHive~channelStateChangedCb} cb - The callback that handles an event
         */
        channelStateChanged: function (cb) {
            cb = utils.createCallback(cb);

            var self = this;
            return this._events.bind('channel.state.changed', function (data) {
                cb.call(self, data);
            });
        },


        /**
         * Subscribes to messages and return a subscription object
         *
         * @memberof module:Core~DeviceHive
         * @param {DeviceHive~subscribeCb} cb - The callback that handles the response
         * @param {DeviceHive~SubscribeParameters} [params = null] - Subscription parameters
         * @return {module:Core~Subscription} - Added subscription object
         */
        subscribe: function (cb, params) {
            this._ensureConnectedState();
            cb = utils.createCallback(cb);
            params = params || {};

            var channel = this.channel;
            var subscription = new Subscription(params.deviceIds, params.names, params.onMessage);
            channel.subscriptions.push(subscription);
            subscription._changeState(Subscription.states.subscribing);

            channel.subscribe(subscription, function (err, id) {
                if (err) {
                    removeSubscription(channel, subscription);
                    return cb(err);
                }

                subscription._setId(id);
                subscription._changeState(Subscription.states.subscribed);

                return cb(err, subscription);
            });

            return subscription;
        },

        /**
         * Remove subscription to messages
         *
         * @memberof module:Core~DeviceHive
         * @param {(String | module:Core~Subscription)} subscriptionOrId - Identifier of the subscription or subscription object returned by subscribe method
         * @param {DeviceHive~unsubscribeCb} cb - The callback that handles the response
         * @return {module:Core~Subscription} - Added subscription object
         * @throws Will throw an error if subscriptionId was not found
         */
        unsubscribe: function (subscriptionOrId, cb) {
            this._ensureConnectedState();
            cb = utils.createCallback(cb);
            var channel = this.channel;

            if (!subscriptionOrId)
                throw new Error('Subscription must be defined. To unsubscribe from all subscriptions just close the channel');

            var subscription = subscriptionOrId;

            if (!(subscriptionOrId instanceof Subscription)) {
                subscription = findSubscription(channel, subscriptionOrId);

                if (!subscription)
                    return cb(utils.errorMessage('Subscription with id ' + subscriptionOrId + ' was not found'));
            }

            if (subscription.state === Subscription.states.unsubscribed) {
                return cb(null);
            }

            return channel.unsubscribe(subscription, function (err) {
                if (err)
                    return cb(err);

                removeSubscription(channel, subscription);

                return cb(err, subscription);
            });
        },

        _ensureConnectedState: function () {
            if (this.channelState === this.channelStates.disconnected) {
                throw new Error('DeviceHive: Channel is not opened, call the .openChannel() method first');
            }
            if (this.channelState === this.channelStates.connecting) {
                throw new Error('DeviceHive: Channel has not been initialized, use .openChannel().done() to run logic after the channel is initialized');
            }
        }
    };

    return DeviceHive;
}());

/**
 * A callback function which is executed when an operation has been completed
 * @callback noDataCallback
 * @param {module:Core~DHError} err - An error object if any errors occurred
 */

/**
 * Error object which is passed to the callback if an error occurred
 * @typedef {Object} DHError
 * @property {boolean} error - Error message
 * @property {boolean} http - An object representing a transport mechanism if an error is related ot transport problems.
 */

/**
 * Http request object
 * @typedef {Object} Http
 * @property {function} abort - Aborts current request
 */
