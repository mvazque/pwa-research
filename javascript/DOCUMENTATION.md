# Javascript PWA

## About
This was the initial web app that was created in the process of implementing PWA to this PWA. This contains a basic web app using JavaScript, HTML and CSS. It will be a PWA in its most simplest of forms.

## Running this application
1. Run `npm install`
2. Run `npm run start`


## Summary of Files
### assets
This folder is meant to contain images that will be used in the application (notification images, manifest icon images etc)

### js
This contains files used in working with IndexDB both in the application and the service worker. IndexDB is an api in the browser that allows for storing items in the cache and have more manipulation options than just the cache. The files in particular simplify the usage of IndexDB as it does have difficulties to work with. 

### manifest.json
This is the manifest file required for letting the browser how to present the web app in its PWA format.

#### manifest.webmanifest breakdown
* `name`: This is the name of the web app and should the user download the app this will be the name they will see for it
* `short_name`: This is the name of the application to be used in text limited areas such as mobile devices
* `theme_color`: This will be a color used while the application is starting up if it has been downloaded
* `background_color`: Background color that will be used while the application is starting up if it has been downloaded
* `display`: This dictates how the downloaded web app should appear. Whether its similar to being a browser window or a native application
* `scope`: Represents the service worker's [scope](https://developer.mozilla.org/en-US/docs/Web/Manifest/scope)
* `start_url`: The root directory of the files involved in the web application
* `icons`: This is an array for the icons to be used. These icons will be used in the representations of the application in various devices
  * `src`: The location of the image to use
  * `sizes`: Dictates the dimensions of the provided image
  * `type`: The media type of the icon
  * `purpose`: What the icon can be used for


## package.json
The main package needed for this application is `http-server` which we use to host the application along with the service worker

# Breakdown of Service Worker
## importScripts
This section is used to import any additional scripts that are needed for the application to function. In this case it is used to import the indexDB utility scripts. But it can be used to import other items like the Angular service worker in cases where we want to add to its' functionality

## CACHE_NAME
These are the names we use for the caches used in the service worker. Service workers do not update unless they detect a change. 

In cases where you make a change to the web app and not the application (say typo fix in the HTML), the service worker may still serve up the previous cached version. Updating the name of the cache will let the service worker detect a change but will also force the Service Worker to use a new cache and store documents to the new cache instead of serving up existing pre-cached items.

## STATIC_FILES
This is a list of static files we wish to pre-cache. That is to say files we want to store on our cache when the app first loads. This can include the whole application but bear in mind having to much stored in cache can cause some performance slow downs. So it is best to consider which files you want to have cached and instead cache pages dynamically once the user visits them for the first time.

## Event Listener "install"
[MDN Docs Service Worker Install](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event)  
This action fires when a new service worker has been registered. It still has not been activated but the browser is aware of it and will use it once the activation criteria has been met.

The code here caches all the files listed under `STATIC_FILES`. These files will be saved to the cache and can be used by the service worker in the future. In this case it is used for showing content in the application even if the user is offline.

## Event Listener "activate"
[MDN Docs Service Worker Activate](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/activate_event)

This action fires when the service worker is finally activated. That means if there was a previous service worker it has be removed and the new one is in place or if there wasn't a previous service worker the new one is now activated.

The code here cleans up previous caches if there has been a change in the version of the caches. So if we went from `static-v1` to `static-v2`, on activation `static-v1` will be deleted to avoid our cache from being cluttered.

## Event Listener "fetch"
[MDN Docs Service Worker Fetch](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/fetch_event)

This action fires whenever a fetch request is made by the web application.

### fetchJsonDataAsync
This if branch is in charge of handling endpoint calls to getting json data. For example in this case reaching out to the endpoint and getting the todo items from the backend. We set a separate branch in order to handle what we do with the JSON data. In this case we retrieve the JSON data and then store it in the cache under the `todos` table.

### isInArray
This branch is for calls to getting a page in the web app. Since we have certain pages, images, stylesheets saved to our static cache from the precaching we can intercept the fetch request and instead return what we have cached. This both helps with speed of getting the application up as well as handles cases where we might be offline and can't get the pages from a network call. The cache should always be available as long as the user has visited the page once.

### fetchResponse
This is the branch used in cases where we are serving up items that are not JSON data. 

In particular we check for `text/html` items. Here with the intercepted call we first check if it is content we already have saved in our dynamic cache. If the content is found that is what we will return. 

If content is not found, the fetch call will be made. Based on the response different actions will be taken.

If the response from the fetch is of status 404 we will serve up `not-found.html` from our static cache. In other words a not found page will be shown to the user

If the response is valid however we will store the page in our dynamic cache for future use and show the user the requested page.

If there is an error during this process we will instead assume that this is due to the user being offline and show them an offline saying so.


## Event Listener "sync"
[MDN Docs Service Worker Sync](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/sync_event)


This action fires when the sync manager has a sync event registered. On top of this, the web app needs to be online, if instead it is offline the sync manager will hold onto this event until a later point when the user is back online.

Because you can add a tag to the sync event in the code her we are listening for the `sync-new-todo`. When it is found it will grab the items in the `todos-sync` indexDB store that were stored when the user created a todo. if the fetch went through and completed that item wll be removed from the indexDB store.


## Event Listener "notificationclick"
[MDN Docs Service Worker Notification Click](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event)

This action is fired when a notification created by the service worker has been clicked

Actions can be added to the notification on creation and when the user clicks on one of them that will be listed on the `notificationclick` event

For this code we check if the `confirm` action is clicked and simply print a log just to showcase this feature

All other click actions will set focus to the window. If no window is open with the web app active, one will be created.

This works by using the [Clients](https://developer.mozilla.org/en-US/docs/Web/API/Clients) property of the browser/service worker. This will return a list of the clients available. If any client has a url matching the url of provided by the notification it will change focus to that window. If not it will open and focus on a new window.

## Event Listener "notificationclose"
[MDN Docs Service Notification Close](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclose_event)

This action fires when a user closes a notification. That is they click the 'x' close button on the notification

For this POC we just print a console log just to showcase the event listener exists and when it would be fired.

## Event Listener "push"
[MDN Docs Service Push](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event)

This action fires when the browser service "pushes" a notification to the service worker.

For this POC we take the event and read the data provided. This is used to generate a notification and then show the notification once it is ready.

