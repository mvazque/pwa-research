if( 'function' === typeof importScripts) {
  importScripts('./ngsw-worker.js');
  importScripts('/service-worker-utility/idb.js');
  importScripts('/service-worker-utility/index-db-utility.js');
}

const SERVICE_WORKER_VERSION = 1;

const azureFunctionUrl = 'https://orange-sea-0d3361410.4.azurestaticapps.net/api';


const syncNewTodo = async() => {
    console.log('[Service Worker] Will attempt to sync todo', azureFunctionUrl);
    const endpointUrl = azureFunctionUrl + '/todos';
    const todos = await readAllData('todoSync')
    for(let todo of todos){
        try{
          const fetchRes = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(todo)
          })
          console.log('[Service Worker] Clearing Synced Todo from IndexedDB');
          if(fetchRes.ok){
              await deleteSingleItem('todoSync' ,todo.id);
          }
        }
        catch{
          return new Error('Something went wrong');
        }

    }
    return todos;
}

// Background sync is natively supported.
if('sync' in self.registration){
  self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Syncing', event);
    if(event.tag === 'sync-new-todo') {
        console.log('[Service Worker] Syncing New Todos');
        event.waitUntil(
            syncNewTodo()
        )
    }
  });
}
else{
  // Background sync is not natively supported.
  addEventListener("online", (event) => {
    console.log('[Service Worker] User is now online. Going to try and sync todos');
    if(storeHasData('todoSync')){
      event.waitUntil(
        syncNewTodo()
      )
    }

  });
}

/**
 * Notification Events
 */
const windowFocus = async(notification) => {
  const clientsArr = await clients.matchAll({type: 'window'})
  const hadWindowToFocus = clientsArr.some((windowClient) => {
      if(windowClient.url === notification.data.url) {
          windowClient.focus();
          return true;
      }
      return false;
  });

  if(!hadWindowToFocus){
      clients.openWindow(notification.data.url);
  }

  return;
}

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  if(action === 'confirm'){
      console.log('[Service Worker] Notification was confirmed');
  } else{
      notification.close();
      event.waitUntil(
          windowFocus(notification)
      )
  }

  notification.close();
});
