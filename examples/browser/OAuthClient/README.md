Installation:
============

Before opening this example application, please make sure you have added an OAuth client to the DeviceHive.
The OAuth client entity must have the following properties set:

* domain: should correspond to the domain of the current application
* redirectUrl: should correspond to the URL of the current page
* oauthId: an arbitrary value

Change JavaScript variables (deviceHiveUrl, oauthUrl, oauthRedirectUrl, oauthClientId, oauthScope) in the index.html 
in accordance to the OAuth client entity and DeviceHive configuration.

To install script files, run:

```sh
$ bower install
``` 