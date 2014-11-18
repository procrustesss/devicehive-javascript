var JqDHDevice = (function ($) {
    'use strict';

    var JqDHDevice = function (serviceUrl, deviceId, deviceKeyOrAccessKey) {
        DHDevice.call(this, serviceUrl, deviceId, deviceKeyOrAccessKey);
    };

    $.extend(JqDHDevice.prototype, DHDevice.prototype, {
        getDevice: jqUtils.toDeferredLast(DHDevice.prototype.getDevice),
        registerDevice: jqUtils.toDeferredLast(DHDevice.prototype.registerDevice),
        updateDevice: jqUtils.toDeferredLast(DHDevice.prototype.updateDevice),

        subscribe: function(){
            var self = this;

            return jqUtils.toDeferredFirst(DHDevice.prototype.subscribe, function (sub) {
                sub._handleMessage = function(deviceId, cmd){
                    self._populateCmd(cmd);

                    var oldUpdate = cmd.update;
                    cmd.update = jqUtils.toDeferredLast(oldUpdate);

                    sub._handleMessageOld(cmd)
                };

                return sub;
            }).apply(this, arguments);
        },
        unsubscribe: jqUtils.toDeferredLast(DHDevice.prototype.unsubscribe),

        sendNotification: jqUtils.toDeferredLast(DHDevice.prototype.sendNotification),
        openChannel: jqUtils.toDeferredFirst(DHDevice.prototype.openChannel),
        closeChannel: jqUtils.toDeferredLast(DHDevice.prototype.closeChannel)
    });

    return $.dhDevice = function (serviceUrl, deviceId, deviceKeyOrAccessKey) {
        return new JqDHDevice(serviceUrl, deviceId, deviceKeyOrAccessKey);
    };

}(jQuery));