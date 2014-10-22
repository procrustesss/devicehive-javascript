var restApi = (function () {
    'use strict';

    var authTypes = {
        USER: 1,
        KEY: 2,
        DEVICE: 4
    };

    var isFlagSet = function (variable, flag) {
        return (variable & flag) == flag;
    };

    var applyAuth = function (request, params) {
        var authType = params.authTypes;
        var auth = params.auth;
        request.headers = params.headers || {};

        if (!authType)
            return;

        if (!auth) {
            // library bug
            throw new Error('Authentication parameters must be specified for this endpoint. Endpoint auth code: ' + authType)
        }

        if (isFlagSet(authType, authTypes.KEY) && auth.accessKey) {
            // Set bearer token authorization
            request.headers['Authorization'] = 'Bearer ' + auth.accessKey;
        } else if (isFlagSet(authType, authTypes.DEVICE)
            && auth.deviceId && auth.deviceKey) {

            // Set Device authorization
            request.headers['Auth-DeviceID'] = auth.deviceId;
            request.headers['Auth-DeviceKey'] = auth.deviceKey;
        } else if (isFlagSet(authType, authTypes.USER)) {

            // Set User authorization
            request.headers['Authorization'] = 'Basic ' + utils.encodeBase64(auth.login + ':' + auth.password);
        } else {
            // library bug, therefore crash is necessary
            throw new Error('Invalid authentication parameters. Endpoint auth code: ' + authType);
        }
    };

    var send = function (params, cb) {
        var req = {
            method: params.method,
            url: params.base + params.relative,
            data: params.data
        };
        applyAuth(req, params);
        return http.send(req, cb);
    };

    return {

        /* API INFO */

        info: function (serviceUrl, cb) {
            return send({
                base: serviceUrl,
                relative: '/info',
                method: 'GET'
            }, cb);
        },

        /* ACCESS KEYS */

        getAccessKeys: function (serviceUrl, auth, userId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey',
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        getAccessKey: function (serviceUrl, auth, userId, keyId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + userId,
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        insertAccessKey: function (serviceUrl, auth, userId, key, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey',
                data: key,
                method: 'POST',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateAccessKey: function (serviceUrl, auth, userId, keyId, key, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + keyId,
                data: key,
                method: 'PUT',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        deleteAccessKey: function (serviceUrl, auth, userId, keyId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + keyId,
                method: 'DELETE',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* DEVICE */

        getDevices: function (serviceUrl, auth, filter, cb) {
            return send({
                base: serviceUrl,
                relative: '/device',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getDevice: function (serviceUrl, auth, deviceId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        getEquipmentState: function (serviceUrl, auth, deviceId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/equipment',
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        registerDevice: function (serviceUrl, auth, deviceId, device, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId,
                method: 'PUT',
                data: device,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        /* DEVICE CLASS */

        getDeviceClass: function (serviceUrl, auth, deviceClassId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/class/' + deviceClassId,
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* COMMAND */

        getCommands: function (serviceUrl, auth, deviceId, filter, cb) {
            if (filter && filter.start) {
                filter.start = utils.formatDate(filter.start);
            }
            if (filter && filter.end) {
                filter.end = utils.formatDate(filter.end);
            }

            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        getCommand: function (serviceUrl, auth, deviceId, cmdId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        insertCommand: function (serviceUrl, auth, deviceId, cmd, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command',
                method: 'POST',
                data: cmd,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        updateCommand: function (serviceUrl, auth, deviceId, cmdId, cmd, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId,
                method: 'PUT',
                data: cmd,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollCommands: function (serviceUrl, auth, deviceId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollManyCommands: function (serviceUrl, auth, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/command/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        waitCommandResult: function (serviceUrl, auth, deviceId, cmdId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId + '/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        /* NOTIFICATION */

        getNotifications: function (serviceUrl, auth, deviceId, filter, cb) {
            if (filter && filter.start) {
                filter.start = utils.formatDate(filter.start);
            }
            if (filter && filter.end) {
                filter.end = utils.formatDate(filter.end);
            }

            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getNotification: function (serviceUrl, auth, deviceId, notificationId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification/' + notificationId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        insertNotification: function (serviceUrl, auth, deviceId, notification, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification',
                method: 'POST',
                data: notification,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollNotifications: function (serviceUrl, auth, deviceId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        pollManyNotifications: function (serviceUrl, auth, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/notification/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        /* NETWORK */

        getNetworks: function (serviceUrl, auth, filter, cb) {
            return send({
                base: serviceUrl,
                relative: '/network',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getNetwork: function (serviceUrl, auth, networkId, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        insertNetwork: function (serviceUrl, auth, network, cb) {
            return send({
                base: serviceUrl,
                relative: '/network',
                method: 'POST',
                data: network,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateNetwork: function (serviceUrl, auth, networkId, network, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'PUT',
                data: network,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        deleteNetwork: function (serviceUrl, auth, networkId, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'DELETE',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* OAUTH CLIENT */

        /* OAUTH GRANT */

        /* USER */

        getCurrentUser: function (serviceUrl, auth, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/current',
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateCurrentUser: function (serviceUrl, auth, user, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/current',
                method: 'PUT',
                data: user,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        }
    };
}());