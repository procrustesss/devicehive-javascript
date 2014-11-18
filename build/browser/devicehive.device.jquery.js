(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.JqDHDevice = factory();
  }
}(this, function() {
var jqUtils = (function ($) {
    'use strict';

    var toDeferred = function (func, ind, resWrapper) {
        return function () {
            var def = $.Deferred(),
                args = Array.prototype.slice.call(arguments);

            ind = (typeof ind !== 'undefined') ? ind : args.length;
            args.splice(ind, 0, function (err, res) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(resWrapper ? resWrapper(res) : res);
                }
            });

            return $.extend(true, func.apply(this, args), def.promise());
        }
    };

    return {
        toDeferredLast: function (func, resWrapper) {
            return toDeferred(func, void 0, resWrapper);
        },

        toDeferredFirst: function (func, resWrapper) {
            return toDeferred(func, 0, resWrapper);
        }
    };
}(jQuery));
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
return JqDHDevice;
}));
