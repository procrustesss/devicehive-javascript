var app = {

    // start the application
    start: function (deviceHive, deviceId) {
        this.deviceHive = deviceHive;

        // get device information
        var that = this;
        this.deviceHive.getDevice(deviceId)
            .done(function (device) {
                that.device = device;
                that.updateDeviceInfo(device);
                that.bindLedControl();
                that.getLedState();
            })
            .fail(that.handleError);
    },
    
    // gets current led state
    getLedState: function () {
        var that = this;
        this.deviceHive.getEquipmentState(this.device.id)
            .done(function (data) {
                var lastTimestamp = null;
                jQuery.each(data, function (index, equipment) {
                    if (equipment.id == "LED") {
                        lastTimestamp = equipment.timestamp;
                        that.updateTimestamp(equipment.timestamp);
                        that.updateLedState(equipment.parameters.state);
                    }
                });
                that.pollNotifications(lastTimestamp);
            })
            .fail(that.handleError);
    },

    // start polling device notification
    pollNotifications: function (timestamp) {
        var that = this;
        this.deviceHive.startNotificationPolling(this.device.id, timestamp, function(notification) {
            if (notification.notification == "equipment" && notification.parameters.equipment == "LED") {
                that.updateTimestamp(notification.timestamp);
                that.updateLedState(notification.parameters.state); 
            }
        }, that.handleError);
    },

    // bind LED On/Off button click handler
    bindLedControl: function() {
        var that = this;
        $(".send").click(function() {
            var state = $(this).is(".on") ? "1" : "0";
            that.deviceHive.sendCommand(that.device.id, "UpdateLedState", { equipment: "LED", state: state })
                .fail(that.handleError);
        });
    },

    // updates device information on the page
    updateDeviceInfo: function (device) {
        $(".device-name").text(device.name);
        $(".device-status").text(device.status);
    },

    // updates last notification timestamp on the page
    updateTimestamp: function (timestamp) {
        timestamp = this.deviceHive.parseDate(timestamp);
        $(".device-last-update").text(this.formatDate(timestamp));
    },

    // updates LED state on the page
    updateLedState: function (state) {
        var on = state == 1 || state == "1";
        $(".device-led-state").removeClass("on off").addClass(on ? "on" : "off");
    },
    
    formatDate: function(date) {
        var pad = function(d) { return d < 10 ? "0" + d : d; };
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
    },

    handleError: function (xhr) {
        alert("DeviceHive service returned an error: " + xhr.responseText);
    }
}