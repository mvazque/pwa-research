# Azure Function

## About
To fully test the POC we want to have it hosted on an actual website with working endpoints and a storage. For this we are using Azure and it services. In this case Azure Functions will be used to host the endpoints between the web application and Azure Storage which will be hosting our data.

## Running this application
1. Run `npm install`
2. Run `npm run start`
  * This will host the functions locally. A url for where to access the endpoints should be shown on the terminal


## Quick Summary of endpoints
### getTodos.ts
Will return all of the ToDo Items in Azure Storage

### todos.ts
Will allow user to POST ToDo items so they are saved to Azure Storage