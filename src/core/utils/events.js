var Events = (function () {
    'use strict';

    var Events = function () {
    };

    Events.prototype = {
        bind: function (name, callback, context) {
            this._handlers || (this._handlers = {});
            var events = this._handlers[name] || (this._handlers[name] = []);
            events.push({callback: callback, context: context || this});

            var self = this;
            return {
                unbind: function(){
                    self.unbind(name, callback);
                }
            };
        },

        unbind: function (name, callback) {
            if (!name && !callback) {
                this._handlers = null;
                return this;
            }

            var events = this._handlers[name];
            if (!events) {
                return this;
            }

            if (!callback) {
                delete this._handlers[name];
                return this;
            }

            var remaining = [];

            utils.forEach(events, function () {
                var ev = this;
                if (callback && callback !== ev.callback) {
                    remaining.push(ev);
                }
            });

            if (remaining.length) {
                this._handlers[name] = remaining;
            } else {
                delete this._handlers[name];
            }

            return this;
        },

        trigger: function (name) {
            if (!this._handlers) {
                return this;
            }

            var args = utils.toArray(arguments).slice(1),
                events = this._handlers[name];

            events && this._triggerEvents(events, args);
            return this;
        },

        _triggerEvents: function (events, args) {
            utils.forEach(events, function () {
                var ev = this;
                ev.callback.apply(ev.context, args);
            });
        }

    };

    return Events;
}());