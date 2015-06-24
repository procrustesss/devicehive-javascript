var DHClient = (function () {
    'use strict';

    /**
     * DHClient object constructor
     * specify login & password or access key as an authentication/authorization parameters
     *
     * @class
     * @global
     * @mixes module:Core~DeviceHive
     * @param {String} serviceUrl - DeviceHive cloud API url
     * @param {String} loginOrKey - User's login name or access key
     * @param {String} password - User's password. If access key authentication is used this argument should be omitted
     */
    var DHClient = function (serviceUrl, loginOrKey, password) {
        this.serviceUrl = serviceUrl;

        // save auth information
        this.auth = {};
        if (!password) {
            this.auth.accessKey = loginOrKey;
        } else {
            this.auth.login = loginOrKey;
            this.auth.password = password;
        }
    };

    DHClient.prototype = new DeviceHive();
    DHClient.constructor = DHClient;


    /**
     * Get Networks request filtering parameters
     *
     * @typedef {Object} DHClient~NetworksFilter
     * @property {String} name - filter by network name
     * @property {String} namePattern - filter by network name pattern
     * @property {String} sortField - result list sort field: ID or Name
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback DHClient~getNetworksCb
     * @param {module:Core~DHError} err - an error object if any errors occurred
     * @param {Array} networks - an array of requested networks
     */

    /**
     * Gets a list of networks
     *
     * @memberof DHClient
     * @param {DHClient~NetworksFilter} filter - Networks filter
     * @param {DHClient~getNetworksCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getNetworks = function (filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNetworks, [filter, cb]);
    };


    /**
     * @callback DHClient~getNetworkCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} network - Requested network information
     */

    /**
     * Gets information about the network and associated devices
     *
     * @memberof DHClient
     * @param {String} networkId - Network identifier
     * @param {DHClient~getNetworkCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getNetwork = function (networkId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNetwork, [networkId, cb]);
    };


    /**
     * Get Devices request filtering parameters
     *
     * @typedef {Object} DHClient~DevicesFilter
     * @property {String} name - filter by device name
     * @property {String} namePattern - filter by device name pattern
     * @property {String} status - filter by device status
     * @property {String} networkId - filter by associated network identifier
     * @property {String} networkName - filter by associated network name
     * @property {String} deviceClassId - filter by associated device class identifier
     * @property {String} deviceClassName - filter by associated device class name
     * @property {String} deviceClassVersion - filter by associated device class version
     * @property {String} sortField - result list sort field: Name, Status, Network or DeviceClass
     * @property {String} sortOrder - result list sort order: ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback DHClient~getDevicesCb
     * @param {module:Core~DHError} err - an error object if any errors occurred
     * @param {Array} devices - an array of requested devices
     */

    /**
     * Gets a list of devices
     *
     * @memberof DHClient
     * @param {DHClient~DevicesFilter} filter - Devices filter
     * @param {DHClient~getDevicesCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getDevices = function (filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getDevices, [filter, cb]);
    };


    /**
     * @callback DHClient~getDeviceCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} device - Requested device information
     */

    /**
     * Gets information about the device
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {DHClient~getDeviceCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getDevice = function (deviceId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getDevice, [deviceId, cb]);
    };

    /**
     * @callback DHClient~getDeviceClassCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} deviceClass - Requested device class information
     */

    /**
     * Gets information about a device class and associated equipment
     *
     * @memberof DHClient
     * @param {String} deviceClassId - Device Class identifier
     * @param {DHClient~getDeviceClassCb} cb - The callback that handles the response
     * @throws Will throw an error if user's credentials are not used as an authentication mechanism
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getDeviceClass = function (deviceClassId, cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to get device class information');
        }
        return this._executeApi(restApi.getDeviceClass, [deviceClassId, cb]);
    };


    /**
     * @callback DHClient~getEquipmentStateCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Array} equipmentState - Requested array of equipment states for the specified device
     */

    /**
     * Gets a list of device equipment states (current state of device equipment)
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {DHClient~getEquipmentStateCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getEquipmentState = function (deviceId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getEquipmentState, [deviceId, cb]);
    };


    /**
     * Get Notifications request filtering parameters
     *
     * @typedef {Object} DHClient~NotificationsFilter
     * @property {Date} start - filter by notification start timestamp (inclusive, UTC)
     * @property {Date} end - filter by notification end timestamp (inclusive, UTC)
     * @property {String} notification - filter by notification name
     * @property {String} sortField - result list sort field - Timestamp (default) or Notification
     * @property {String} sortOrder - result list sort order - ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     * @property {String} gridInterval - grid interval in seconds. Filter to retrieve maximum one notification of the same type within the specified grid interval
     */

    /**
     * @callback DHClient~getNotificationsCb
     * @param {module:Core~DHError} err - an error object if any errors occurred
     * @param {Array} notifications - an array of requested notifications
     */

    /**
     * Gets a list of notifications generated by the device
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {DHClient~NotificationsFilter} filter - Notification filter
     * @param {DHClient~getNotificationsCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getNotifications = function (deviceId, filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNotifications, [deviceId, filter, cb]);
    };

    /**
     * @callback DHClient~getNotificationCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} notification - Requested notification information
     */

    /**
     * Gets information about a device class and associated equipment
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {Number} notificationId - Notification identifier
     * @param {DHClient~getNotificationCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getNotification = function (deviceId, notificationId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNotification, [deviceId, notificationId, cb]);
    };


    /**
     * Gets a list of commands previously sent to the device
     *
     * @typedef {Object} DHClient~CommandsFilter
     * @property {Date}   start - filter by command start timestamp (inclusive, UTC)
     * @property {Date}   end - filter by command end timestamp (inclusive, UTC)
     * @property {String} command - filter by command name
     * @property {String} status - filter by command status
     * @property {String} sortField - result list sort field - Timestamp (default), Command or Status
     * @property {String} sortOrder - result list sort order - ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback DHClient~getCommandsCb
     * @param {module:Core~DHError} err - an error object if any errors occurred
     * @param {Array} commands - an array of requested commands
     */

    /**
     * Gets a list of notifications generated by the device
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {DHClient~CommandsFilter} filter - Notification filter
     * @param {DHClient~getCommandsCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getCommands = function (deviceId, filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getCommands, [deviceId, filter, cb]);
    };

    /**
     * @callback DHClient~getCommandCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} command - requested command information
     */

    /**
     * Gets information about a device command
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {Number} commandId - Notification identifier
     * @param {DHClient~getCommandCb} cb - The callback that handles the response
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getCommand = function (deviceId, commandId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getCommand, [deviceId, commandId, cb]);
    };


    /**
     * @callback DHClient~getCurrentUserCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} user - information about the current user
     */

    /**
     * Gets information about the logged-in user and associated networks
     *
     * @memberof DHClient
     * @param {DHClient~getCurrentUserCb} cb - The callback that handles the response
     * @throws Will throw an Error if an access key is used as an authentication mechanism
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.getCurrentUser = function (cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to get current user information');
        }
        return this._executeApi(restApi.getCurrentUser, [cb]);
    };

    /**
     * Updates information for the current user
     *
     * @memberof DHClient
     * @param {Object} user - User info
     * @param {module:Core~noDataCallback} cb - The callback that handles the response
     * @throws Will throw an Error if an access key is used as an authentication mechanism
     * @returns {module:Core~Http} - current module:Core~Http request
     */
    DHClient.prototype.updateCurrentUser = function (user, cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to update current user');
        }
        return this._executeApi(restApi.updateCurrentUser, [user, cb]);
    };

    /**
     * @typedef {Object} DHClient~SendCommandResult
     * @property {DHClient~commandResult} result - Waits for the command to be completed
     */

    /**
     * Wait for result function
     * @typedef {function} DHClient~commandResult
     * @param {commandResultCallback} cb
     * @param {Number} waitTimeout - Timestamp to wait for the result in seconds. Default = 30 seconds. Maximum for longpolling channel = 60 seconds
     */

    /**
     * A callback function which is executed when the device has processed a command and has sent the result to the DeviceHive cloud
     * @callback DHClient~commandResultCallback
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} res - Processing result of the command
     */

    /**
     * @callback DHClient~sendCommandCb
     * @param {module:Core~DHError} err - An error object if any errors occurred
     * @param {Object} cmd - Already sent command
     */

    /**
     * Sends a new command to the device
     *
     * @memberof DHClient
     * @param {String} deviceId - Device identifier
     * @param {String} command - Command name
     * @param {Object} parameters - Command parameters
     * @param {DHClient~sendCommandCb} cb - The callback that handles the response
     * @returns {DHClient~SendCommandResult}
     */
    DHClient.prototype.sendCommand = function (deviceId, command, parameters, cb) {
        cb = utils.createCallback(cb);
        this._ensureConnectedState();
        return this.channel.sendCommand(deviceId, { command: command, parameters: parameters }, cb);
    };

    DHClient.prototype._executeApi = function (endpoint, args) {
        var endpointParams = [this.serviceUrl, this.auth].concat(args);
        return endpoint.apply(null, endpointParams);
    };

    DHClient.prototype._channels = {};
    DHClient.prototype._channels.websocket = WebSocketClientChannel;
    DHClient.prototype._channels.longpolling = LongPollingClientChannel;

    /**
     * DHClient channel states
     * @memberof DHClient
     * @borrows module:Core~DeviceHive.channelStates
     */
    DHClient.channelStates = DHClient.prototype.channelStates;

    /**
     * DHClient subscription states
     * @memberof DHClient
     * @borrows module:Core~Subscription.states
     */
    DHClient.subscriptionStates = Subscription.states;

    return DHClient;
}());
