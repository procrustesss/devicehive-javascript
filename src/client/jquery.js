var JqDHClient = (function ($) {
    'use strict';

    var JqDHClient = function (serviceUrl, loginOrKey, password) {
        DHClient.call(this, serviceUrl, loginOrKey, password);
    };

    var wrappedSendCommand = jqUtils.toDeferredLast(DHClient.prototype.sendCommand);
    $.extend(JqDHClient.prototype, DHClient.prototype, {
        getNetworks: jqUtils.toDeferredLast(DHClient.prototype.getNetworks),
        getNetwork: jqUtils.toDeferredLast(DHClient.prototype.getNetwork),
        getDevices: jqUtils.toDeferredLast(DHClient.prototype.getDevices),
        getDevice: jqUtils.toDeferredLast(DHClient.prototype.getDevice),
        getDeviceClass: jqUtils.toDeferredLast(DHClient.prototype.getDeviceClass),
        getEquipmentState: jqUtils.toDeferredLast(DHClient.prototype.getEquipmentState),
        getNotifications: jqUtils.toDeferredLast(DHClient.prototype.getNotifications),
        getNotification: jqUtils.toDeferredLast(DHClient.prototype.getNotification),
        getCommands: jqUtils.toDeferredLast(DHClient.prototype.getCommands),
        getCommand: jqUtils.toDeferredLast(DHClient.prototype.getCommand),
        getCurrentUser: jqUtils.toDeferredLast(DHClient.prototype.getCurrentUser),
        updateCurrentUser: jqUtils.toDeferredLast(DHClient.prototype.updateCurrentUser),

        subscribe: jqUtils.toDeferredFirst(DHClient.prototype.subscribe),
        unsubscribe: jqUtils.toDeferredLast(DHClient.prototype.unsubscribe),
        sendCommand: function(){
            var cmd = wrappedSendCommand.apply(this, arguments);
            cmd.result = jqUtils.toDeferredFirst(cmd.result);
            return cmd;
        },

        openChannel: jqUtils.toDeferredFirst(DHClient.prototype.openChannel),
        closeChannel: jqUtils.toDeferredLast(DHClient.prototype.closeChannel)
    });

    return $.dhClient = function (serviceUrl, loginOrKey, password) {
        return new JqDHClient(serviceUrl, loginOrKey, password);
    };

}(jQuery));