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
                    if (!lastTimestamp || equipment.timestamp > lastTimestamp) {
                        lastTimestamp = equipment.timestamp;
                    }
                    if (equipment.id == "LED") {
                        that.updateLedState(equipment.parameters.state);
                    }
                    else if (equipment.id == "temp") {
                        that.updateTemperature(equipment.parameters.temperature);
                    }
                });
                if (lastTimestamp) {
                    that.updateTimestamp(lastTimestamp);
                }
                that.pollNotifications(lastTimestamp);
            })
            .fail(that.handleError);
    },

    // start polling device notification
    pollNotifications: function (timestamp) {
        var that = this;
        this.deviceHive.startNotificationPolling(this.device.id, timestamp, function(notification) {
            that.updateTimestamp(notification.timestamp);
            if (notification.notification == "equipment") {
                if (notification.parameters.equipment == "LED") that.updateLedState(notification.parameters.state); 
                if (notification.parameters.equipment == "temp") that.updateTemperature(notification.parameters.temperature);
            }
            else if (notification.notification == "$device-update") {
                if (notification.parameters.status) that.device.status = notification.parameters.status;
                if (notification.parameters.name) that.device.name = notification.parameters.name;
                that.updateDeviceInfo(that.device);
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

    // updates temperature on the page
    updateTemperature: function (temperature) {
        $(".device-temperature").text(temperature);
        $(".device-temperature").toggleClass("big", temperature >= 30);
    },

    formatDate: function(date) {
        var pad = function(d) { return d < 10 ? "0" + d : d; };
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
    },

    handleError: function (xhr) {
        alert("DeviceHive service returned an error: " + xhr.responseText);
    }
}