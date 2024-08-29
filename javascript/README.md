1. IDB Package?
https://github.com/jakearchibald/idb
```
npm install idb
```


1. when testing notifications for PWA not that they are not allowed on incognito windows
1. Also note the PWA can't be installed on incognito




## Background Sync
One thing to note is that its possible for an error in the waitUntil. If its handled a certain way you will be stuck waiting until it retries again.
* In other words the issue was that sync event.waitUntil failed due to trying to get a property from undefined
* I would then have to wait a period of time until it timed out or something like that before the sync event would run again
* I think sync event can just get hung up if event.waitUntil isn't stopped properly and is waiting for response whether its success or fail
[Sync Event After Failure on first time](https://stackoverflow.com/questions/44625788/service-worker-sync-event-is-not-getting-fired-again-after-failure-in-first-time)


## Notification 
https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push

https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/

## On Angular
https://medium.com/ngconf/angular-pwa-install-and-configure-858dd8e9fb07


https://blog.angular-university.io/angular-service-worker/

When building make use of this command
`npx ng build --configuration production`

https://stackoverflow.com/questions/58414364/how-to-edit-your-service-worker-file-for-an-angular-cli-project

Configuration Breakdown for Angular Service Worker
https://angular.io/guide/service-worker-config#datagroups


## Dexie Docs
https://dexie.org/docs/Tutorial/Getting-started



https://stackoverflow.com/questions/58216782/overriding-angulars-service-worker-to-handle-post-requests


Reason for using ts-ignore for sw.sync
https://stackoverflow.com/questions/74232292/navigator-serviceworker-property-sync-does-not-exist-on-type-serviceworkerreg