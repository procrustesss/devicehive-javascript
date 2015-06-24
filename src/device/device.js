var DHDevice = (function () {
    'use strict';

    /**
     * DHDevice object constructor
     * Specify device key or access key as an authentication/authorization parameters
     * Auth type is predicted based on the parameters of the supplied string
     *
     * Note that authentication with device key is deprecated and will be removed in future
     *
     * @class
     * @global
     * @mixes module:Core~DeviceHive
     * @param {String} serviceUrl - DeviceHive cloud API url
     * @param {String} deviceId - Device unique identifier
     * @param {String} accessKeyOrDeviceKey - Access key or device key (device key is deprecated) used for auth
     * @param {Boolean} forceDeviceKeyAuth - Force using the third parameter as a device key
     */
    var DHDevice = function (serviceUrl, deviceId, accessKeyOrDeviceKey, forceDeviceKeyAuth) {
        this.serviceUrl = serviceUrl;
        this.deviceId = deviceId;

        // save auth information
        this.auth = {};
        if (forceDeviceKeyAuth || !utils.isAccessKey(accessKeyOrDeviceKey)) {
            this.auth.deviceId = deviceId;
            this.auth.deviceKey = accessKeyOrDeviceKey;
        } else {
            this.auth.accessKey = accessKeyOrDeviceKey;
        }
    };

    DHDevice.prototype = new DeviceHive();
    DHDevice.constructor = DHDevice;

    /**
     * @callback DHDevice~getDeviceCb
     * @param {module:Core~module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} device - Current device information
     */

    /**
     * Gets information about the current device
     *
     * @memberof DHDevice
     * @param {DHDevice~getDeviceCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - Current module:Core~Http request
     */
    DHDevice.prototype.getDevice = function (cb) {
        cb = utils.createCallback(cb);

        return this._executeApi(restApi.getDevice, [cb]);
    };

    /**
     * Registers a device in the DeviceHive network with the current device id
     * device key will be implicitly added if specified as an authentication parameter
     *
     * @memberof DHDevice
     * @param {Object} device - Device parameters
     * @param {module:Core~noDataCallback} cb - The callback that handles the response
     * @returns {module:Core~Http} - Current module:Core~Http request
     */
    DHDevice.prototype.registerDevice = function (device, cb) {
        cb = utils.createCallback(cb);

        if (device.key && this.auth.deviceKey && device.key !== this.auth.deviceKey)
            throw new Error('Conflicting device keys on device registration');

        device.key = device.key || this.auth.deviceKey;

        if (!device.key) {
            throw new Error('Device key was not provided during the DHDevice object creation and therefore must be specified in the parameters')
        }

        return this._executeApi(restApi.registerDevice, [device, cb]);
    };

    /**
     * Updates a device in the DeviceHive network with the current device id
     *
     * @memberof DHDevice
     * @param {Object} device - Device parameters
     * @param {module:Core~noDataCallback} cb - The callback that handles the response
     * @returns {module:Core~Http} - Current module:Core~Http request
     */
    DHDevice.prototype.updateDevice = function (device, cb) {
        cb = utils.createCallback(cb);

        return this._executeApi(restApi.registerDevice, [device, cb]);
    };

    /**
     * Sends new notification to the client
     *
     * @memberof DHDevice
     * @param {String} notification - Notification name
     * @param {Object} params - Notification parameters
     * @param {module:Core~noDataCallback} cb - The callback that handles the response
     * @returns {module:Core~Http} - Current module:Core~Http request
     */
    DHDevice.prototype.sendNotification = function (notification, params, cb) {
        cb = utils.createCallback(cb);

        this._ensureConnectedState();
        return this.channel.sendNotification({
            notification: {notification: notification, parameters: params},
            deviceGuid: this.deviceId
        }, cb);
    };


    /**
     * @callback DHDevice~notificationSubscribeCb
     * @param {module:Core~module:Core~DHError} err - An error object if any errors occurred
     * @param {DHDevice~NotificationSubscription} subscription - added subscription object
     */

    /**
     * @typedef {Object} DHDevice~NotificationSubscribeParameters
     * @property {function} onMessage - initial callback that will be invoked when a command is received
     * @property {(Array | String)} names - notification name, array of notifications or null (subscribe to all notifications)
     */

    /**
     * @typedef {Subscription} DHDevice~NotificationSubscription
     * @property {DHDevice~notificationReceivedCb} cb - a callback that will be invoked when a command is received
     */

    /**
     * @callback DHDevice~notificationReceivedCb
     * @param {DHDevice~ReceivedCommand} command - Received command information
     */

    /**
     * @typedef {Object} DHDevice~ReceivedCommand
     * @property {DHDevice~updateCommandFunction} update - function for updating the current command with the result
     */

    /**
     * @typedef {function} DHDevice~updateCommandFunction
     * @param {Object} result - command result
     * @param {function} cb - The callback that handles the response
     * @throws {Error} - throws an error if status is not specified
     */

    /**
     * @callback DHDevice~getDeviceCb
     * @param {module:Core~module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} device - Current device information
     */

    var oldSubscribe = DHDevice.prototype.subscribe;
    /**
     * Subscribes to device commands and returns a subscription object
     * Use subscription object to bind to a 'new command received' event
     * use command.update to specify command result parameters
     *
     * @memberof DHDevice
     * @override
     * @param {DHDevice~notificationSubscribeCb} cb - The callback that handles the response
     * @param {DHDevice~NotificationSubscribeParameters} params - Subscription parameters
     * @returns {DHDevice~NotificationSubscription} - Added subscription object
     */
    DHDevice.prototype.subscribe = function (cb, params) {
        params = params || {};
        params.deviceIds = [this.deviceId];

        var sub = oldSubscribe.call(this, cb, params);

        sub._handleMessageOld = sub._handleMessage;
        var self = this;

        // overwrite _handleMessage to add additional functionality to command object
        sub._handleMessage = function (deviceId, cmd) {
            self._populateCmd(cmd);
            sub._handleMessageOld(cmd);
        };

        return sub;
    };

    DHDevice.prototype._populateCmd = function (cmd) {
        var channel = this.channel;
        var selfDeviceId = this.deviceId;
        cmd.update = function (params, onUpdated) {
            onUpdated = utils.createCallback(onUpdated);

            if (!params || !params.status) {
                throw new Error('Command status must be specified');
            }

            var updateParams = {};
            updateParams.commandId = cmd.id;
            updateParams.command = params || {};
            updateParams.deviceGuid = selfDeviceId;

            return channel.updateCommand(updateParams, onUpdated);
        };
    };

    DHDevice.prototype._executeApi = function (endpoint, args) {
        var endpointParams = [this.serviceUrl, this.auth, this.deviceId].concat(args);
        return endpoint.apply(null, endpointParams);
    };

    DHDevice.prototype._channels = {};
    DHDevice.prototype._channels.websocket = WebSocketDeviceChannel;
    DHDevice.prototype._channels.longpolling = LongPollingDeviceChannel;

    /**
     * DHDevice channel states
     * @memberof DHDevice
     * @borrows module:Core~DeviceHive.channelStates
     */
    DHDevice.channelStates = DHDevice.prototype.channelStates;

    /**
     * DHDevice subscription states
     * @memberof DHDevice
     * @borrows module:Core~Subscription.states
     */
    DHDevice.subscriptionStates = Subscription.states;

    return DHDevice;
}());
