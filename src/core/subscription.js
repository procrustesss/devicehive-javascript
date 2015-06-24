var Subscription = (function () {
    'use strict';

    /**
     * @class
     * @classdesc Subscription object constructor
     * @memberof module:Core
     * @inner
     */
    var Subscription = function (deviceIds, names, onMessage) {
        if (deviceIds && !utils.isArray(deviceIds)) {
            deviceIds = [deviceIds];
        }

        if (names && !utils.isArray(names)) {
            names = [names];
        }

        this.deviceIds = deviceIds || null;
        this.names = names || null;
        this.state = Subscription.states.unsubscribed;

        this._events = new Events();

        this.message(onMessage);
    };

    /**
     * @callback Subscription~subscriptionStateChangedCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {module:Core~DeviceHive~State} state - A channel state object
     */

    /**
     * Adds a callback that will be invoked when the subscription state is changed
     *
     * @param {Subscription~subscriptionStateChangedCb} cb - The callback that handles an event
     */
    Subscription.prototype.stateChanged = function (cb) {
        cb = utils.createCallback(cb);

        var self = this;
        return this._events.bind('state.changed', function (data) {
            cb.call(self, data);
        });
    };

    /**
     * @callback Subscription~messageReceivedCb
     * @param {Object} message - Received message
     */

    /**
     * Adds a callback that will be invoked when a message is received
     *
     * @param {Subscription~messageReceivedCb} cb - The callback that handles an event
     */
    Subscription.prototype.message = function (cb) {
        cb = utils.createCallback(cb);
        return this._events.bind('message', cb);
    };

    Subscription.prototype._handleMessage = function (msg) {
        if(this.state !== Subscription.states.subscribed)
            return;

        this._events.trigger.apply(this._events, ['message'].concat(utils.toArray(arguments)))
    };

    Subscription.prototype._changeState = function (newState) {
        if (this.state === newState) {
            return false;
        }

        var oldState = this.state;
        this.state = newState;
        this._events.trigger('state.changed', { oldState: oldState, newState: newState });
    };

    Subscription.prototype._setId = function (id) {
        this.id = id || utils.guid();
    };

    Subscription.prototype.toJSON = function () {
        return { deviceIds: this.deviceIds, names: this.names, state: this.state };
    };

    /**
     * Subscription states
     * @readonly
     * @enum {number}
     */
    Subscription.states = {
        /** subscription is unsubscribed */
        unsubscribed: 0,
        /** subscription is being subscribed */
        subscribing: 1,
        /** subscription is subscribed */
        subscribed: 2
    };

    return Subscription;
}());
