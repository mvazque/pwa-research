# API Legacy

## About
During development there was a need for endpoints to fully test and develop the PWA functionalities. For the sake of simplicity a Node Express application was created to emulate a server for the service worker and web application to call.

## Running this application
1. Run `npm install`
2. Run `node api.js`
  * This will host the functions locally. A url for where to access the endpoints should be shown on the terminal


## Quick Summary of endpoints
* `POST /:filename`: This endpoint will take the request object and save it to an existing/created file matching filename. If the file name is anything other than "subscription" there will be additional code to also push out a notification to all of the subscriptions that are stored on the local server in the `subscriptions.json` file
* `GET /:filename`: This endpoint will return all of the items saved in the JSON file that matches the provided filename