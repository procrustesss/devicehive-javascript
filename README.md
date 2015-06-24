[![Build Status](https://travis-ci.org/devicehive/devicehive-javascript.svg?branch=master)](https://travis-ci.org/devicehive/devicehive-javascript)
[![Bower version](https://badge.fury.io/bo/devicehive.svg)](http://badge.fury.io/bo/devicehive)

#DeviceHive JavaScript framework

[DeviceHive]: http://devicehive.com "DeviceHive framework"
[DataArt]: http://dataart.com "DataArt"
[DeviceHive RESTful protocol]: http://www.devicehive.com/restful "DeviceHive RESTful protocol"

[DeviceHive] turns any connected device into the part of Internet of Things.
It provides the communication layer, control software and multi-platform
libraries to bootstrap development of smart energy, home automation, remote
sensing, telemetry, remote control and monitoring software and much more.

Connect embedded Linux using Python or C++ libraries and JSON protocol or
connect AVR, Microchip devices using lightweight C libraries and BINARY protocol.
Develop client applications using HTML5/JavaScript, iOS and Android libraries.
For solutions involving gateways, there is also gateway middleware that allows
to interface with devices connected to it. Leave communications to [DeviceHive]
and focus on actual product and innovation.

JavaScript framework is a wrapper around [DeviceHive RESTful protocol] that includes a set of methods to access corresponding [DeviceHive] resources.

#Components

##Client

This library could be a very good choice to quickly prototype an HTML client for your custom device. It could also be used in complex applications to enable interaction with the [DeviceHive] server from the client-side components. Check out [DHClient API Reference](#DHClient) to get information about all of the available fields and methods.

The library supports the following actions:

* Authenticate with login and password or with an access key.
* Get information about [DeviceHive] networks, devices and device classes
* Get current state of equipment that devices have onboard
* Get real-time notifications from devices about various events
* Send a command to a particular device

##Device

This library can be used on the Device side. Any device which support `javascript` can be connected with DeviceHive using this module. Check out [DHDevice API Reference](#DHDevice) to get information about all of the available fields and methods.
The library supports the following actions:

* Authenticate with a device key or with an access key.
* Register and update a device in the [DeviceHive] network
* Get information about the current device
* Get and update real-time commands from clients
* Send a notification to the cloud

#Compatibility

**Client** and **Device** libraries could be used in the following environments:

* Chrome
* Safari
* Firefox
* IE 10, 11

`Node.js` support will be added in future, but still you can leverage [DeviceHive] on `node` by workarounding transport related specifics. 
For example you can install a library which implements XMLHttpRequest and use only `longpolling` channel.

#Installation:

##Browser

Install package with bower:

```sh
$ bower install devicehive
```

or download package files from [`build\browser`](build/browser) folder. 

After that you should add references to your HTML file.

You can also use `JQuery` wrappers to utilize `Deferred`s instead of node-style callbacks.

#Usage

Create new instance of the `DHClient` or `DHDevice`

```js
// Create DHClient instance specifying login and password as an auth parameters
var dhClient = new DHClient("http://xxxxx.pg.devicehive.com/api", "login", "password");

// Create DHClient instance specifying access key as an auth parameter
var dhClient = new DHClient("http://xxxxx.pg.devicehive.com/api", "AccessKeyExampleAccessKeyExampleAccessKeyEx=");

// Create DHDevice instance specifying device id and device key as an auth parameters
var dhDevice = new DHDevice("http://xxxxx.pg.devicehive.com/api", "someDeviceId_123-456", "someCustomDeviceKey");

// Create DHDevice instance specifying device id and access key as an auth parameters
var dhDevice = new DHDevice("http://xxxxx.pg.devicehive.com/api", "someDeviceId_123-456", "AccessKeyExampleAccessKeyExampleAccessKeyEx=");
```

or if you want to use `Deferred`s use builders from `JQuery` object

```js
var dhClient = $.dhClient("http://xxxx.pg.devicehive.com/api", "login", "password");
```

After creating a new instance you will be able to get relevant information from the [DeviceHive] cloud

```js
// Use DHClient library to get information about devices registered in the cloud
dhClient.getDevices(null, function(err, devices){
    if(!err)
        doWork(devices);
});
```

also you can register devices and update data in the cloud

```js
// Use DHDevice library to register your device in the cloud.
// It will be registered with an id specified during DHDevice instance creation 
dhDevice.registerDevice({
    name: "My Device",
    // device key which can be used for device authentication.
    key: "some device key",
    // object with a description of the device class or existing device class id
    deviceClass: {
        name: 'My Device Class',
        version: '0.0.1',
        equipment: [
            { name: 'Example sensor', type: 'sensor', code: '1234' }
        ]
    }
}, function(err, res) {
    console.log(err ? 'failed' : 'success');
});
```

You can check [Core Implementation](src/core/devicehive.js), [DHClient Implementation](src/client/client.js) and [DHDevice Implementation](src/device/device.js) or read [DeviceHive RESTful protocol] reference to get more information about supported methods.

##Channels

The framework also implements a facility to continuously receive device notifications, send notification, receive client commands and send client commands.
These features utilizes WebSocket or HTTP long-polling mechanisms supported by [DeviceHive]. In order to provide that functionality, the library uses a concept of channels to transmit messages between the server and client. 
Clients and devices should simply open a channel, subscribe to messages and then handle them in the corresponding callback methods.

To open the channel

```js
dhClient.openChannel(callbackFunction, channelName)
```

Channel names are `websocket` and `longpolling`. If `channelName` is not passed then the first compatible channel will be opened.

You can also subscribe for a channel state changed event:

```js
// bind
var eventSubscription = dhClient.channelStateChanged(function(state){
    console.log(state.oldState);
    console.log(state.newState);
});

// unbind
eventSubscription.unbind();
```

After the channel is opened your clients will be able to interact with the devices in a real-time fashion. 

Take a look at this example for the **Client** library:

```js
// Open the channel for DHDevice instance
dhClient.openChannel(function(err) {
    if (err) return;

    // Send device command with custom parameters to the device with deviceId identifier
    var cmd = dhClient.sendCommand(deviceId, 'command_name', {
        someParameter: 'someValue'
    });

    // Do some work after the command is processed by the device with an id "deviceId"
    cmd.result(function(res) {
        doSomeWork(res);
    }, waitTimeout);

    // Start listening for notif1 and notif2 notifications from devices with deviceId1 and deviceId2 identifiers
    var options = {
        // optional device id or array of ids
        // if not specified subscription will be created for all devices
        deviceIds: [deviceId1, deviceId2],
        // optional notification name or array of names,
        // if not specified will listen for all notifications
        names: ['notif1', 'notif2']
    };
    // pass the callback as a first parameter and options as a second
    // if options object was not passed subscription will listen for all notifications for all devices
    var subscription = dhClient.subscribe(function(err, subscription) {
        if (!err)
            console.log('subscribed successfully')
    }, options);

    // add handler for the subscription which will be invoked when a new notification is received
    subscription.message(function(notification) {
        doSomeWork(notification);
    });

    // add as many handlers as you wish
    var handler = subscription.message(function(notification) {
        doSomeAdditionalWork(notification);
    });

    // and of course you can remove any handler
    handler.unbind();
});

// Close the channel for DHClient instance
dhClient.closeChannel();
```

Here is an example for the **Device** library:

```js

// Open the channel for DHDevice instance
dhDevice.openChannel(function(err) {
    if (err) return;

    // Send device notification with the custom parameters
    dhDevice.sendNotification('notification_name', {
        someParameter: 'someValue'
    });

    // Start listening for command1 and command2 sent by some client
    var options = {
        // optional command name or array of names,
        // if not specified will listen for all commands
        names: ['command1', 'command2']
    };
    // pass the callback as a first parameter and options as a second
    // if options object was not passed subscription will listen for all commands
    var subscription = dhDevice.subscribe(function(err, subscription) {
        if (!err)
            console.log('subscribed successfully')
    }, options);

    // add handler for the subscription which will be invoked when a new command is received
    subscription.message(function(cmd) {
        var workResult = doSomeWork(cmd);

        // Update a received command so the client can be notified about the result
        cmd.update(workResult);
    });

    // add as many handlers as you wish
    var handler = subscription.message(function(notification) {
        doSomeAdditionalWork(notification);
    });

    // and of course you can remove any handler
    handler.unbind();
});

// Close the channel for DHDevice instance
dhDevice.closeChannel();
```

##CONTRIBUTING

Please run `gulp test` before committing to ensure your changes don't affect existing features.
Editor preferences are available in the editor config for easy use in common text editors. Read more and download plugins at http://editorconfig.org.

##TODO

* Node.js support
* Remove deprecated features

# Library API Reference

* [DHClient](#DHClient) - DeviceHive Client API Reference
* [DHDevice](#DHDevice) - DeviceHive Device API Reference

<a name="DHClient"></a>
## DHClient
**Kind**: global class  
**Mixes**: <code>[DeviceHive](#module_Core..DeviceHive)</code>  

* [DHClient](#DHClient)
  * [new DHClient(serviceUrl, loginOrKey, password)](#new_DHClient_new)
  * _instance_
    * [.channelStates](#DHClient+channelStates) : <code>enum</code>
    * [.getNetworks(filter, cb)](#DHClient+getNetworks) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getNetwork(networkId, cb)](#DHClient+getNetwork) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getDevices(filter, cb)](#DHClient+getDevices) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getDevice(deviceId, cb)](#DHClient+getDevice) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getDeviceClass(deviceClassId, cb)](#DHClient+getDeviceClass) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getEquipmentState(deviceId, cb)](#DHClient+getEquipmentState) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getNotifications(deviceId, filter, cb)](#DHClient+getNotifications) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getNotification(deviceId, notificationId, cb)](#DHClient+getNotification) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getCommands(deviceId, filter, cb)](#DHClient+getCommands) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getCommand(deviceId, commandId, cb)](#DHClient+getCommand) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.getCurrentUser(cb)](#DHClient+getCurrentUser) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.updateCurrentUser(user, cb)](#DHClient+updateCurrentUser) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.sendCommand(deviceId, command, parameters, cb)](#DHClient+sendCommand) ⇒ <code>[SendCommandResult](#DHClient..SendCommandResult)</code>
    * [.openChannel(cb, [channels])](#DHClient+openChannel)
    * [.closeChannel(cb)](#DHClient+closeChannel)
    * [.channelStateChanged(cb)](#DHClient+channelStateChanged)
    * [.subscribe(cb, [params])](#DHClient+subscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
    * [.unsubscribe(subscriptionOrId, cb)](#DHClient+unsubscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
  * _static_
    * [.channelStates](#DHClient.channelStates)
    * [.subscriptionStates](#DHClient.subscriptionStates)
  * _inner_
    * [~NetworksFilter](#DHClient..NetworksFilter) : <code>Object</code>
    * [~getNetworksCb](#DHClient..getNetworksCb) : <code>function</code>
    * [~getNetworkCb](#DHClient..getNetworkCb) : <code>function</code>
    * [~DevicesFilter](#DHClient..DevicesFilter) : <code>Object</code>
    * [~getDevicesCb](#DHClient..getDevicesCb) : <code>function</code>
    * [~getDeviceCb](#DHClient..getDeviceCb) : <code>function</code>
    * [~getDeviceClassCb](#DHClient..getDeviceClassCb) : <code>function</code>
    * [~getEquipmentStateCb](#DHClient..getEquipmentStateCb) : <code>function</code>
    * [~NotificationsFilter](#DHClient..NotificationsFilter) : <code>Object</code>
    * [~getNotificationsCb](#DHClient..getNotificationsCb) : <code>function</code>
    * [~getNotificationCb](#DHClient..getNotificationCb) : <code>function</code>
    * [~CommandsFilter](#DHClient..CommandsFilter) : <code>Object</code>
    * [~getCommandsCb](#DHClient..getCommandsCb) : <code>function</code>
    * [~getCommandCb](#DHClient..getCommandCb) : <code>function</code>
    * [~getCurrentUserCb](#DHClient..getCurrentUserCb) : <code>function</code>
    * [~SendCommandResult](#DHClient..SendCommandResult) : <code>Object</code>
    * [~commandResult](#DHClient..commandResult) : <code>function</code>
    * [~commandResultCallback](#DHClient..commandResultCallback) : <code>function</code>
    * [~sendCommandCb](#DHClient..sendCommandCb) : <code>function</code>


-

<a name="new_DHClient_new"></a>
### new DHClient(serviceUrl, loginOrKey, password)
DHClient object constructor
specify login & password or access key as an authentication/authorization parameters


| Param | Type | Description |
| --- | --- | --- |
| serviceUrl | <code>String</code> | DeviceHive cloud API url |
| loginOrKey | <code>String</code> | User's login name or access key |
| password | <code>String</code> | User's password. If access key authentication is used this argument should be omitted |


-

<a name="DHClient+channelStates"></a>
### dhClient.channelStates : <code>enum</code>
DeviceHive channel states

**Kind**: instance enum property of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[channelStates](#module_Core..DeviceHive.channelStates)</code>  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disconnected | <code>number</code> | <code>0</code> | channel is not connected |
| connecting | <code>number</code> | <code>1</code> | channel is being connected |
| connected | <code>number</code> | <code>2</code> | channel is connected |


-

<a name="DHClient+getNetworks"></a>
### dhClient.getNetworks(filter, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets a list of networks

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>[NetworksFilter](#DHClient..NetworksFilter)</code> | Networks filter |
| cb | <code>[getNetworksCb](#DHClient..getNetworksCb)</code> | The callback that handles the response |


-

<a name="DHClient+getNetwork"></a>
### dhClient.getNetwork(networkId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about the network and associated devices

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| networkId | <code>String</code> | Network identifier |
| cb | <code>[getNetworkCb](#DHClient..getNetworkCb)</code> | The callback that handles the response |


-

<a name="DHClient+getDevices"></a>
### dhClient.getDevices(filter, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets a list of devices

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>[DevicesFilter](#DHClient..DevicesFilter)</code> | Devices filter |
| cb | <code>[getDevicesCb](#DHClient..getDevicesCb)</code> | The callback that handles the response |


-

<a name="DHClient+getDevice"></a>
### dhClient.getDevice(deviceId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about the device

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| cb | <code>[getDeviceCb](#DHClient..getDeviceCb)</code> | The callback that handles the response |


-

<a name="DHClient+getDeviceClass"></a>
### dhClient.getDeviceClass(deviceClassId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about a device class and associated equipment

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  
**Throws**:

- Will throw an error if user's credentials are not used as an authentication mechanism


| Param | Type | Description |
| --- | --- | --- |
| deviceClassId | <code>String</code> | Device Class identifier |
| cb | <code>[getDeviceClassCb](#DHClient..getDeviceClassCb)</code> | The callback that handles the response |


-

<a name="DHClient+getEquipmentState"></a>
### dhClient.getEquipmentState(deviceId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets a list of device equipment states (current state of device equipment)

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| cb | <code>[getEquipmentStateCb](#DHClient..getEquipmentStateCb)</code> | The callback that handles the response |


-

<a name="DHClient+getNotifications"></a>
### dhClient.getNotifications(deviceId, filter, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets a list of notifications generated by the device

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| filter | <code>[NotificationsFilter](#DHClient..NotificationsFilter)</code> | Notification filter |
| cb | <code>[getNotificationsCb](#DHClient..getNotificationsCb)</code> | The callback that handles the response |


-

<a name="DHClient+getNotification"></a>
### dhClient.getNotification(deviceId, notificationId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about a device class and associated equipment

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| notificationId | <code>Number</code> | Notification identifier |
| cb | <code>[getNotificationCb](#DHClient..getNotificationCb)</code> | The callback that handles the response |


-

<a name="DHClient+getCommands"></a>
### dhClient.getCommands(deviceId, filter, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets a list of notifications generated by the device

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| filter | <code>[CommandsFilter](#DHClient..CommandsFilter)</code> | Notification filter |
| cb | <code>[getCommandsCb](#DHClient..getCommandsCb)</code> | The callback that handles the response |


-

<a name="DHClient+getCommand"></a>
### dhClient.getCommand(deviceId, commandId, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about a device command

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| commandId | <code>Number</code> | Notification identifier |
| cb | <code>[getCommandCb](#DHClient..getCommandCb)</code> | The callback that handles the response |


-

<a name="DHClient+getCurrentUser"></a>
### dhClient.getCurrentUser(cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about the logged-in user and associated networks

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  
**Throws**:

- Will throw an Error if an access key is used as an authentication mechanism


| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[getCurrentUserCb](#DHClient..getCurrentUserCb)</code> | The callback that handles the response |


-

<a name="DHClient+updateCurrentUser"></a>
### dhClient.updateCurrentUser(user, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Updates information for the current user

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - current module:Core~Http request  
**Throws**:

- Will throw an Error if an access key is used as an authentication mechanism


| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | User info |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHClient+sendCommand"></a>
### dhClient.sendCommand(deviceId, command, parameters, cb) ⇒ <code>[SendCommandResult](#DHClient..SendCommandResult)</code>
Sends a new command to the device

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| deviceId | <code>String</code> | Device identifier |
| command | <code>String</code> | Command name |
| parameters | <code>Object</code> | Command parameters |
| cb | <code>[sendCommandCb](#DHClient..sendCommandCb)</code> | The callback that handles the response |


-

<a name="DHClient+openChannel"></a>
### dhClient.openChannel(cb, [channels])
Opens the first compatible communication channel to the server

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[openChannel](#module_Core..DeviceHive.openChannel)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[openChannelCb](#DeviceHive..openChannelCb)</code> |  | The callback that handles the response |
| [channels] | <code>Array</code> &#124; <code>String</code> | <code></code> | Channel names to open. Default supported channels: 'websocket', 'longpolling' |


-

<a name="DHClient+closeChannel"></a>
### dhClient.closeChannel(cb)
Closes the communications channel to the server

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[closeChannel](#module_Core..DeviceHive.closeChannel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHClient+channelStateChanged"></a>
### dhClient.channelStateChanged(cb)
Adds a callback that will be invoked when the communication channel state is changed

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[channelStateChanged](#module_Core..DeviceHive.channelStateChanged)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[channelStateChangedCb](#DeviceHive..channelStateChangedCb)</code> | The callback that handles an event |


-

<a name="DHClient+subscribe"></a>
### dhClient.subscribe(cb, [params]) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Subscribes to messages and return a subscription object

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[subscribe](#module_Core..DeviceHive.subscribe)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[subscribeCb](#DeviceHive..subscribeCb)</code> |  | The callback that handles the response |
| [params] | <code>[SubscribeParameters](#DeviceHive..SubscribeParameters)</code> | <code></code> | Subscription parameters |


-

<a name="DHClient+unsubscribe"></a>
### dhClient.unsubscribe(subscriptionOrId, cb) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Remove subscription to messages

**Kind**: instance method of <code>[DHClient](#DHClient)</code>  
**Mixes**: <code>[unsubscribe](#module_Core..DeviceHive.unsubscribe)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  
**Throws**:

- Will throw an error if subscriptionId was not found


| Param | Type | Description |
| --- | --- | --- |
| subscriptionOrId | <code>String</code> &#124; <code>[Subscription](#module_Core..Subscription)</code> | Identifier of the subscription or subscription object returned by subscribe method |
| cb | <code>[unsubscribeCb](#DeviceHive..unsubscribeCb)</code> | The callback that handles the response |


-

<a name="DHClient.channelStates"></a>
### DHClient.channelStates
DHClient channel states

**Kind**: static property of <code>[DHClient](#DHClient)</code>  

-

<a name="DHClient.subscriptionStates"></a>
### DHClient.subscriptionStates
DHClient subscription states

**Kind**: static property of <code>[DHClient](#DHClient)</code>  

-

<a name="DHClient..NetworksFilter"></a>
### DHClient~NetworksFilter : <code>Object</code>
Get Networks request filtering parameters

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | filter by network name |
| namePattern | <code>String</code> | filter by network name pattern |
| sortField | <code>String</code> | result list sort field: ID or Name |
| take | <code>Number</code> | number of records to take from the result list |
| skip | <code>Number</code> | number of records to skip from the result list |


-

<a name="DHClient..getNetworksCb"></a>
### DHClient~getNetworksCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | an error object if any errors occurred |
| networks | <code>Array</code> | an array of requested networks |


-

<a name="DHClient..getNetworkCb"></a>
### DHClient~getNetworkCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| network | <code>Object</code> | Requested network information |


-

<a name="DHClient..DevicesFilter"></a>
### DHClient~DevicesFilter : <code>Object</code>
Get Devices request filtering parameters

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | filter by device name |
| namePattern | <code>String</code> | filter by device name pattern |
| status | <code>String</code> | filter by device status |
| networkId | <code>String</code> | filter by associated network identifier |
| networkName | <code>String</code> | filter by associated network name |
| deviceClassId | <code>String</code> | filter by associated device class identifier |
| deviceClassName | <code>String</code> | filter by associated device class name |
| deviceClassVersion | <code>String</code> | filter by associated device class version |
| sortField | <code>String</code> | result list sort field: Name, Status, Network or DeviceClass |
| sortOrder | <code>String</code> | result list sort order: ASC or DESC |
| take | <code>Number</code> | number of records to take from the result list |
| skip | <code>Number</code> | number of records to skip from the result list |


-

<a name="DHClient..getDevicesCb"></a>
### DHClient~getDevicesCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | an error object if any errors occurred |
| devices | <code>Array</code> | an array of requested devices |


-

<a name="DHClient..getDeviceCb"></a>
### DHClient~getDeviceCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| device | <code>Object</code> | Requested device information |


-

<a name="DHClient..getDeviceClassCb"></a>
### DHClient~getDeviceClassCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| deviceClass | <code>Object</code> | Requested device class information |


-

<a name="DHClient..getEquipmentStateCb"></a>
### DHClient~getEquipmentStateCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| equipmentState | <code>Array</code> | Requested array of equipment states for the specified device |


-

<a name="DHClient..NotificationsFilter"></a>
### DHClient~NotificationsFilter : <code>Object</code>
Get Notifications request filtering parameters

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| start | <code>Date</code> | filter by notification start timestamp (inclusive, UTC) |
| end | <code>Date</code> | filter by notification end timestamp (inclusive, UTC) |
| notification | <code>String</code> | filter by notification name |
| sortField | <code>String</code> | result list sort field - Timestamp (default) or Notification |
| sortOrder | <code>String</code> | result list sort order - ASC or DESC |
| take | <code>Number</code> | number of records to take from the result list |
| skip | <code>Number</code> | number of records to skip from the result list |
| gridInterval | <code>String</code> | grid interval in seconds. Filter to retrieve maximum one notification of the same type within the specified grid interval |


-

<a name="DHClient..getNotificationsCb"></a>
### DHClient~getNotificationsCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | an error object if any errors occurred |
| notifications | <code>Array</code> | an array of requested notifications |


-

<a name="DHClient..getNotificationCb"></a>
### DHClient~getNotificationCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| notification | <code>Object</code> | Requested notification information |


-

<a name="DHClient..CommandsFilter"></a>
### DHClient~CommandsFilter : <code>Object</code>
Gets a list of commands previously sent to the device

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| start | <code>Date</code> | filter by command start timestamp (inclusive, UTC) |
| end | <code>Date</code> | filter by command end timestamp (inclusive, UTC) |
| command | <code>String</code> | filter by command name |
| status | <code>String</code> | filter by command status |
| sortField | <code>String</code> | result list sort field - Timestamp (default), Command or Status |
| sortOrder | <code>String</code> | result list sort order - ASC or DESC |
| take | <code>Number</code> | number of records to take from the result list |
| skip | <code>Number</code> | number of records to skip from the result list |


-

<a name="DHClient..getCommandsCb"></a>
### DHClient~getCommandsCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | an error object if any errors occurred |
| commands | <code>Array</code> | an array of requested commands |


-

<a name="DHClient..getCommandCb"></a>
### DHClient~getCommandCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| command | <code>Object</code> | requested command information |


-

<a name="DHClient..getCurrentUserCb"></a>
### DHClient~getCurrentUserCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| user | <code>Object</code> | information about the current user |


-

<a name="DHClient..SendCommandResult"></a>
### DHClient~SendCommandResult : <code>Object</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| result | <code>[commandResult](#DHClient..commandResult)</code> | Waits for the command to be completed |


-

<a name="DHClient..commandResult"></a>
### DHClient~commandResult : <code>function</code>
Wait for result function

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>commandResultCallback</code> |  |
| waitTimeout | <code>Number</code> | Timestamp to wait for the result in seconds. Default = 30 seconds. Maximum for longpolling channel = 60 seconds |


-

<a name="DHClient..commandResultCallback"></a>
### DHClient~commandResultCallback : <code>function</code>
A callback function which is executed when the device has processed a command and has sent the result to the DeviceHive cloud

**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| res | <code>Object</code> | Processing result of the command |


-

<a name="DHClient..sendCommandCb"></a>
### DHClient~sendCommandCb : <code>function</code>
**Kind**: inner typedef of <code>[DHClient](#DHClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |
| cmd | <code>Object</code> | Already sent command |


-



<a name="DHDevice"></a>
## DHDevice
**Kind**: global class  
**Mixes**: <code>[DeviceHive](#module_Core..DeviceHive)</code>  

* [DHDevice](#DHDevice)
  * [new DHDevice(serviceUrl, deviceId, accessKeyOrDeviceKey, forceDeviceKeyAuth)](#new_DHDevice_new)
  * _instance_
    * [.channelStates](#DHDevice+channelStates) : <code>enum</code>
    * [.getDevice(cb)](#DHDevice+getDevice) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.registerDevice(device, cb)](#DHDevice+registerDevice) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.updateDevice(device, cb)](#DHDevice+updateDevice) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.sendNotification(notification, params, cb)](#DHDevice+sendNotification) ⇒ <code>[Http](#module_Core..Http)</code>
    * [.subscribe(cb, params)](#DHDevice+subscribe) ⇒ <code>[NotificationSubscription](#DHDevice..NotificationSubscription)</code>
    * [.openChannel(cb, [channels])](#DHDevice+openChannel)
    * [.closeChannel(cb)](#DHDevice+closeChannel)
    * [.channelStateChanged(cb)](#DHDevice+channelStateChanged)
    * [.subscribe(cb, [params])](#DHDevice+subscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
    * [.unsubscribe(subscriptionOrId, cb)](#DHDevice+unsubscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
  * _static_
    * [.channelStates](#DHDevice.channelStates)
    * [.subscriptionStates](#DHDevice.subscriptionStates)
  * _inner_
    * [~getDeviceCb](#DHDevice..getDeviceCb) : <code>function</code>
    * [~notificationSubscribeCb](#DHDevice..notificationSubscribeCb) : <code>function</code>
    * [~NotificationSubscribeParameters](#DHDevice..NotificationSubscribeParameters) : <code>Object</code>
    * [~NotificationSubscription](#DHDevice..NotificationSubscription) : <code>Subscription</code>
    * [~notificationReceivedCb](#DHDevice..notificationReceivedCb) : <code>function</code>
    * [~ReceivedCommand](#DHDevice..ReceivedCommand) : <code>Object</code>
    * [~updateCommandFunction](#DHDevice..updateCommandFunction) : <code>function</code>
    * [~getDeviceCb](#DHDevice..getDeviceCb) : <code>function</code>


-

<a name="new_DHDevice_new"></a>
### new DHDevice(serviceUrl, deviceId, accessKeyOrDeviceKey, forceDeviceKeyAuth)
DHDevice object constructor
Specify device key or access key as an authentication/authorization parameters
Auth type is predicted based on the parameters of the supplied string

Note that authentication with device key is deprecated and will be removed in future


| Param | Type | Description |
| --- | --- | --- |
| serviceUrl | <code>String</code> | DeviceHive cloud API url |
| deviceId | <code>String</code> | Device unique identifier |
| accessKeyOrDeviceKey | <code>String</code> | Access key or device key (device key is deprecated) used for auth |
| forceDeviceKeyAuth | <code>Boolean</code> | Force using the third parameter as a device key |


-

<a name="DHDevice+channelStates"></a>
### dhDevice.channelStates : <code>enum</code>
DeviceHive channel states

**Kind**: instance enum property of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[channelStates](#module_Core..DeviceHive.channelStates)</code>  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disconnected | <code>number</code> | <code>0</code> | channel is not connected |
| connecting | <code>number</code> | <code>1</code> | channel is being connected |
| connected | <code>number</code> | <code>2</code> | channel is connected |


-

<a name="DHDevice+getDevice"></a>
### dhDevice.getDevice(cb) ⇒ <code>[Http](#module_Core..Http)</code>
Gets information about the current device

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - Current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[getDeviceCb](#DHDevice..getDeviceCb)</code> | The callback that handles the response |


-

<a name="DHDevice+registerDevice"></a>
### dhDevice.registerDevice(device, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Registers a device in the DeviceHive network with the current device id
device key will be implicitly added if specified as an authentication parameter

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - Current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | Device parameters |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHDevice+updateDevice"></a>
### dhDevice.updateDevice(device, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Updates a device in the DeviceHive network with the current device id

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - Current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | Device parameters |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHDevice+sendNotification"></a>
### dhDevice.sendNotification(notification, params, cb) ⇒ <code>[Http](#module_Core..Http)</code>
Sends new notification to the client

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Returns**: <code>[Http](#module_Core..Http)</code> - - Current module:Core~Http request  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>String</code> | Notification name |
| params | <code>Object</code> | Notification parameters |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHDevice+subscribe"></a>
### dhDevice.subscribe(cb, params) ⇒ <code>[NotificationSubscription](#DHDevice..NotificationSubscription)</code>
Subscribes to device commands and returns a subscription object
Use subscription object to bind to a 'new command received' event
use command.update to specify command result parameters

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Returns**: <code>[NotificationSubscription](#DHDevice..NotificationSubscription)</code> - - Added subscription object  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[notificationSubscribeCb](#DHDevice..notificationSubscribeCb)</code> | The callback that handles the response |
| params | <code>[NotificationSubscribeParameters](#DHDevice..NotificationSubscribeParameters)</code> | Subscription parameters |


-

<a name="DHDevice+openChannel"></a>
### dhDevice.openChannel(cb, [channels])
Opens the first compatible communication channel to the server

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[openChannel](#module_Core..DeviceHive.openChannel)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[openChannelCb](#DeviceHive..openChannelCb)</code> |  | The callback that handles the response |
| [channels] | <code>Array</code> &#124; <code>String</code> | <code></code> | Channel names to open. Default supported channels: 'websocket', 'longpolling' |


-

<a name="DHDevice+closeChannel"></a>
### dhDevice.closeChannel(cb)
Closes the communications channel to the server

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[closeChannel](#module_Core..DeviceHive.closeChannel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="DHDevice+channelStateChanged"></a>
### dhDevice.channelStateChanged(cb)
Adds a callback that will be invoked when the communication channel state is changed

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[channelStateChanged](#module_Core..DeviceHive.channelStateChanged)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[channelStateChangedCb](#DeviceHive..channelStateChangedCb)</code> | The callback that handles an event |


-

<a name="DHDevice+subscribe"></a>
### dhDevice.subscribe(cb, [params]) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Subscribes to messages and return a subscription object

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[subscribe](#module_Core..DeviceHive.subscribe)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[subscribeCb](#DeviceHive..subscribeCb)</code> |  | The callback that handles the response |
| [params] | <code>[SubscribeParameters](#DeviceHive..SubscribeParameters)</code> | <code></code> | Subscription parameters |


-

<a name="DHDevice+unsubscribe"></a>
### dhDevice.unsubscribe(subscriptionOrId, cb) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Remove subscription to messages

**Kind**: instance method of <code>[DHDevice](#DHDevice)</code>  
**Mixes**: <code>[unsubscribe](#module_Core..DeviceHive.unsubscribe)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  
**Throws**:

- Will throw an error if subscriptionId was not found


| Param | Type | Description |
| --- | --- | --- |
| subscriptionOrId | <code>String</code> &#124; <code>[Subscription](#module_Core..Subscription)</code> | Identifier of the subscription or subscription object returned by subscribe method |
| cb | <code>[unsubscribeCb](#DeviceHive..unsubscribeCb)</code> | The callback that handles the response |


-

<a name="DHDevice.channelStates"></a>
### DHDevice.channelStates
DHDevice channel states

**Kind**: static property of <code>[DHDevice](#DHDevice)</code>  

-

<a name="DHDevice.subscriptionStates"></a>
### DHDevice.subscriptionStates
DHDevice subscription states

**Kind**: static property of <code>[DHDevice](#DHDevice)</code>  

-

<a name="DHDevice..getDeviceCb"></a>
### DHDevice~getDeviceCb : <code>function</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>module:Core~module:Core~DHError</code> | An error object if any errors occurred |
| device | <code>Object</code> | Current device information |


-

<a name="DHDevice..notificationSubscribeCb"></a>
### DHDevice~notificationSubscribeCb : <code>function</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>module:Core~module:Core~DHError</code> | An error object if any errors occurred |
| subscription | <code>[NotificationSubscription](#DHDevice..NotificationSubscription)</code> | added subscription object |


-

<a name="DHDevice..NotificationSubscribeParameters"></a>
### DHDevice~NotificationSubscribeParameters : <code>Object</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onMessage | <code>function</code> | initial callback that will be invoked when a command is received |
| names | <code>Array</code> &#124; <code>String</code> | notification name, array of notifications or null (subscribe to all notifications) |


-

<a name="DHDevice..NotificationSubscription"></a>
### DHDevice~NotificationSubscription : <code>Subscription</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cb | <code>[notificationReceivedCb](#DHDevice..notificationReceivedCb)</code> | a callback that will be invoked when a command is received |


-

<a name="DHDevice..notificationReceivedCb"></a>
### DHDevice~notificationReceivedCb : <code>function</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>[ReceivedCommand](#DHDevice..ReceivedCommand)</code> | Received command information |


-

<a name="DHDevice..ReceivedCommand"></a>
### DHDevice~ReceivedCommand : <code>Object</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| update | <code>[updateCommandFunction](#DHDevice..updateCommandFunction)</code> | function for updating the current command with the result |


-

<a name="DHDevice..updateCommandFunction"></a>
### DHDevice~updateCommandFunction : <code>function</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  
**Throws**:

- <code>Error</code> - throws an error if status is not specified


| Param | Type | Description |
| --- | --- | --- |
| result | <code>Object</code> | command result |
| cb | <code>function</code> | The callback that handles the response |


-

<a name="DHDevice..getDeviceCb"></a>
### DHDevice~getDeviceCb : <code>function</code>
**Kind**: inner typedef of <code>[DHDevice](#DHDevice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>module:Core~module:Core~DHError</code> | An error object if any errors occurred |
| device | <code>Object</code> | Current device information |


-



<a name="module_Core"></a>
## Core

* [Core](#module_Core)
  * [~Subscription](#module_Core..Subscription)
    * _instance_
      * [.stateChanged(cb)](#module_Core..Subscription+stateChanged)
      * [.message(cb)](#module_Core..Subscription+message)
    * _static_
      * [.states](#module_Core..Subscription.states) : <code>enum</code>
  * [~DeviceHive](#module_Core..DeviceHive)
    * [.channelStates](#module_Core..DeviceHive.channelStates) : <code>enum</code>
    * [.openChannel(cb, [channels])](#module_Core..DeviceHive.openChannel)
    * [.closeChannel(cb)](#module_Core..DeviceHive.closeChannel)
    * [.channelStateChanged(cb)](#module_Core..DeviceHive.channelStateChanged)
    * [.subscribe(cb, [params])](#module_Core..DeviceHive.subscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
    * [.unsubscribe(subscriptionOrId, cb)](#module_Core..DeviceHive.unsubscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
  * [~noDataCallback](#module_Core..noDataCallback) : <code>function</code>
  * [~DHError](#module_Core..DHError) : <code>Object</code>
  * [~Http](#module_Core..Http) : <code>Object</code>


-

<a name="module_Core..Subscription"></a>
### Core~Subscription
Subscription object constructor

**Kind**: inner class of <code>[Core](#module_Core)</code>  

* [~Subscription](#module_Core..Subscription)
  * _instance_
    * [.stateChanged(cb)](#module_Core..Subscription+stateChanged)
    * [.message(cb)](#module_Core..Subscription+message)
  * _static_
    * [.states](#module_Core..Subscription.states) : <code>enum</code>


-

<a name="module_Core..Subscription+stateChanged"></a>
#### subscription.stateChanged(cb)
Adds a callback that will be invoked when the subscription state is changed

**Kind**: instance method of <code>[Subscription](#module_Core..Subscription)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[subscriptionStateChangedCb](#Subscription..subscriptionStateChangedCb)</code> | The callback that handles an event |


-

<a name="module_Core..Subscription+message"></a>
#### subscription.message(cb)
Adds a callback that will be invoked when a message is received

**Kind**: instance method of <code>[Subscription](#module_Core..Subscription)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[messageReceivedCb](#Subscription..messageReceivedCb)</code> | The callback that handles an event |


-

<a name="module_Core..Subscription.states"></a>
#### Subscription.states : <code>enum</code>
Subscription states

**Kind**: static enum property of <code>[Subscription](#module_Core..Subscription)</code>  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| unsubscribed | <code>number</code> | <code>0</code> | subscription is unsubscribed |
| subscribing | <code>number</code> | <code>1</code> | subscription is being subscribed |
| subscribed | <code>number</code> | <code>2</code> | subscription is subscribed |


-

<a name="module_Core..DeviceHive"></a>
### Core~DeviceHive
Core DeviceHive class

**Kind**: inner mixin of <code>[Core](#module_Core)</code>  

* [~DeviceHive](#module_Core..DeviceHive)
  * [.channelStates](#module_Core..DeviceHive.channelStates) : <code>enum</code>
  * [.openChannel(cb, [channels])](#module_Core..DeviceHive.openChannel)
  * [.closeChannel(cb)](#module_Core..DeviceHive.closeChannel)
  * [.channelStateChanged(cb)](#module_Core..DeviceHive.channelStateChanged)
  * [.subscribe(cb, [params])](#module_Core..DeviceHive.subscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
  * [.unsubscribe(subscriptionOrId, cb)](#module_Core..DeviceHive.unsubscribe) ⇒ <code>[Subscription](#module_Core..Subscription)</code>


-

<a name="module_Core..DeviceHive.channelStates"></a>
#### DeviceHive.channelStates : <code>enum</code>
DeviceHive channel states

**Kind**: static enum property of <code>[DeviceHive](#module_Core..DeviceHive)</code>  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disconnected | <code>number</code> | <code>0</code> | channel is not connected |
| connecting | <code>number</code> | <code>1</code> | channel is being connected |
| connected | <code>number</code> | <code>2</code> | channel is connected |


-

<a name="module_Core..DeviceHive.openChannel"></a>
#### DeviceHive.openChannel(cb, [channels])
Opens the first compatible communication channel to the server

**Kind**: static method of <code>[DeviceHive](#module_Core..DeviceHive)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[openChannelCb](#DeviceHive..openChannelCb)</code> |  | The callback that handles the response |
| [channels] | <code>Array</code> &#124; <code>String</code> | <code></code> | Channel names to open. Default supported channels: 'websocket', 'longpolling' |


-

<a name="module_Core..DeviceHive.closeChannel"></a>
#### DeviceHive.closeChannel(cb)
Closes the communications channel to the server

**Kind**: static method of <code>[DeviceHive](#module_Core..DeviceHive)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[noDataCallback](#module_Core..noDataCallback)</code> | The callback that handles the response |


-

<a name="module_Core..DeviceHive.channelStateChanged"></a>
#### DeviceHive.channelStateChanged(cb)
Adds a callback that will be invoked when the communication channel state is changed

**Kind**: static method of <code>[DeviceHive](#module_Core..DeviceHive)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[channelStateChangedCb](#DeviceHive..channelStateChangedCb)</code> | The callback that handles an event |


-

<a name="module_Core..DeviceHive.subscribe"></a>
#### DeviceHive.subscribe(cb, [params]) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Subscribes to messages and return a subscription object

**Kind**: static method of <code>[DeviceHive](#module_Core..DeviceHive)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cb | <code>[subscribeCb](#DeviceHive..subscribeCb)</code> |  | The callback that handles the response |
| [params] | <code>[SubscribeParameters](#DeviceHive..SubscribeParameters)</code> | <code></code> | Subscription parameters |


-

<a name="module_Core..DeviceHive.unsubscribe"></a>
#### DeviceHive.unsubscribe(subscriptionOrId, cb) ⇒ <code>[Subscription](#module_Core..Subscription)</code>
Remove subscription to messages

**Kind**: static method of <code>[DeviceHive](#module_Core..DeviceHive)</code>  
**Returns**: <code>[Subscription](#module_Core..Subscription)</code> - - Added subscription object  
**Throws**:

- Will throw an error if subscriptionId was not found


| Param | Type | Description |
| --- | --- | --- |
| subscriptionOrId | <code>String</code> &#124; <code>[Subscription](#module_Core..Subscription)</code> | Identifier of the subscription or subscription object returned by subscribe method |
| cb | <code>[unsubscribeCb](#DeviceHive..unsubscribeCb)</code> | The callback that handles the response |


-

<a name="module_Core..noDataCallback"></a>
### Core~noDataCallback : <code>function</code>
A callback function which is executed when an operation has been completed

**Kind**: inner typedef of <code>[Core](#module_Core)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[DHError](#module_Core..DHError)</code> | An error object if any errors occurred |


-

<a name="module_Core..DHError"></a>
### Core~DHError : <code>Object</code>
Error object which is passed to the callback if an error occurred

**Kind**: inner typedef of <code>[Core](#module_Core)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>boolean</code> | Error message |
| http | <code>boolean</code> | An object representing a transport mechanism if an error is related ot transport problems. |


-

<a name="module_Core..Http"></a>
### Core~Http : <code>Object</code>
Http request object

**Kind**: inner typedef of <code>[Core](#module_Core)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| abort | <code>function</code> | Aborts current request |


-



##DeviceHive license

[DeviceHive] is developed by [DataArt] Apps and distributed under Open Source
[MIT license](http://en.wikipedia.org/wiki/MIT_License). This basically means
you can do whatever you want with the software as long as the copyright notice
is included. This also means you don't have to contribute the end product or
modified sources back to Open Source, but if you feel like sharing, you are
highly encouraged to do so!

© Copyright 2014 [DataArt] Apps © All Rights Reserved
