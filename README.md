#DeviceHive JavaScript framework

[DeviceHive]: http://devicehive.com "DeviceHive framework"
[DataArt]: http://dataart.com "DataArt"

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

JavaScript framework is a simple wrapper around [DeviceHive RESTful protocol](http://www.devicehive.com/restful) that includes a set of methods to access corresponding [DeviceHive] resources.

#Components

##Client

This library could be a very good choice to quickly prototype an HTML client for your custom device. It could also be used in complex applications to enable interaction with the [DeviceHive] server from the client-side components.

The library supports the following actions:

* Authenticate with login and password or with an access key.
* Get information about [DeviceHive] networks, devices and device classes
* Get current state of equipment that devices have onboard
* Get real-time notifications from devices about various events
* Send a command to a particular device

##Device

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
var dhClient = new DHClient("http://nnXXXX.pg.devicehive.com/api", "login", "password");

// Create DHClient instance specifying access key as an auth parameter
var dhClient = new DHClient("http://nnXXXX.pg.devicehive.com/api", "AccessKeyExampleAccessKeyExampleAccessKeyEx=");

// Create DHDevice instance specifying device id and device key as an auth parameters
var dhDevice = new DHDevice("http://nnXXXX.pg.devicehive.com/api", "someDeviceId_123-456", "someCustomDeviceKey");

// Create DHDevice instance specifying device id and access key as an auth parameters
var dhDevice = new DHDevice("http://nnXXXX.pg.devicehive.com/api", "someDeviceId_123-456", "AccessKeyExampleAccessKeyExampleAccessKeyEx=");
```

or if you want to use `Deferred`s use builders from `JQuery` object

```js
var dhDevice = $.dhDevice("http://nnXXXX.pg.devicehive.com/api", "login", "password");
```

After creating a new instance you will be able to get relevant information from the [DeviceHive] cloud

```js
dhClient.getDevices(function(err, res){
    ....
});
```

also you can register and update data in the cloud

```js
// Device id will be set to the device id specified during DHDevice instance creation
dhDevice.registerDevice({name: "testDevice"}, function(err, res){
    ....
});
```

The first argument in this callback is an error and the second argument is a result of the operation. The error will be `null` if no errors occurred.

You can check [DHClient Implementation](src/client/client.js) and [DHDevice Implementation](src/device/device.js) to get more information about the supported methods.

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
dhClient.openChannel(function(err){
    if(err) return;
    
    // Send device command with custom parameters to the device with someDeviceId identifier
    var cmd = dhClient.sendCommand(someDeviceId, 'test-command-name', { testParameter: 'testValue' });
    
    // Do some work after the command is processed by the device with an id "someDeviceId"
    cmd.result(function(res){
        doSomeWork(res);
    }, waitTimeout);
    
    // Start listening for testCommandName1 and testCommandName2 notifications from devices with someDeviceId1 and someDeviceId2 identifiers
    var subscription = dhClient.subscribe({
        deviceIds: [someDeviceId1, someDeviceId2],
        names: ['testCommandName1', 'testCommandName2']
    }, function(err, subscription){
        if(!err) // subscribed successfully
        ...
    });
    
    // add handler for the subscription which will be invoked when a new notification is received 
    subscription.message(function(ntf){
        doSomeWork(ntf);
    });
    
    // add as many handlers as you wish
    var handler = subscription.message(function(ntf){
        doSomeAdditionalWork(ntf);
    });
    
    ....
    
    // and of course you can remove any handler
    handler.unbind();
});

......

// Close the channel for DHClient instance
dhClient.closeChannel();
```

Here is an example for the **Device** library:

```js
// Open the channel for DHDevice instance
dhDevice.openChannel(function(err){
    if(err) return;
    
    // Send device notification with the custom parameters
    dhDevice.sendNotification('test-notification-name', { testParameter: 'testValue' });
    
    // Start listening for testCommandName1 and testCommandName2 commands
    var subscription = dhClient.subscribe({
        names: ['testCommandName1', 'testCommandName2']
    }, function(err, subscription){
        if(!err) // subscribed successfully
        ...
    });
    
    // add handler for the subscription which will be invoked when a new command is received 
    subscription.message(function(cmd){
        var workResult = doSomeWork(cmd);
        
        // Update a received command so the client can be notified about the result
        cmd.update(workResult);
    });

....

});

......

// Close the channel for DHDevice instance
dhDevice.closeChannel();
```

##TODO

* Node.js support
* Remove deprecated features

##DeviceHive license

[DeviceHive] is developed by [DataArt] Apps and distributed under Open Source
[MIT license](http://en.wikipedia.org/wiki/MIT_License). This basically means
you can do whatever you want with the software as long as the copyright notice
is included. This also means you don't have to contribute the end product or
modified sources back to Open Source, but if you feel like sharing, you are
highly encouraged to do so!

© Copyright 2014 [DataArt] Apps © All Rights Reserved