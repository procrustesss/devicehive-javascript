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