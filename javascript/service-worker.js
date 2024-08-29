if( 'function' === typeof importScripts) {
    importScripts('/js/idb.js');
    importScripts('/js/index-db-utility.js');
}

const STATIC_CACHE_NAME = 'static-v112';
const DYNAMIC_CACHE_NAME = 'dynamic-v112';

const STATIC_FILES = [
    '/',
    /* HTML Files */
    '/index.html',
    // '/help.html',
    '/offline.html',
    '/not-found.html',

    /* JS Files */
    '/index.js',

    /* CSS Files */
    '/index.css',
]


/*
* Service Worker Install event code
*/
const addStaticFiles = async() => {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(STATIC_FILES);
};

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...', event);
    event.waitUntil(
        addStaticFiles()
    )
});




/*
* Service Worker Activate event code
*/
const cacheCleanUp = async() => {
    const keyList = await caches.keys();
    return Promise.all(keyList.map((key) => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
        }
    }))
}

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker ...', event);
    event.waitUntil(
        cacheCleanUp()
    )
    return self.clients.claim();
});


/*
* Service Worker Fetch event code
*/
function isInArray(string, array) {
    let cachePath;
    if(string.indexOf(self.origin) === 0 ){ // request targets domain where we serve the page from (i.e. NOT a CDN)
        cachePath = string.substring(self.origin.length); // Take the part of the URL AFTER the domain (e.g. after localhost:8080)
    }
    else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

const fetchResponse = async(event) => {
    const response = await caches.match(event.request)
    if(response){
        return response;
    }
    else{
        try{
            const res = await fetch(event.request);
            if(res.status === 404){
                const staticCache = await caches.open(STATIC_CACHE_NAME);
                if(event.request.headers.get('accept').includes('text/html')) {
                    return cache.match('/not-found.html');
                }
            }
            const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
            dynamicCache.put(event.request.url, res.clone());
            return res;
        }
        catch{
            const staticCache = await caches.open(STATIC_CACHE_NAME);
            if(event.request.headers.get('accept').includes('text/html')) {
                return staticCache.match('/offline.html');
            }
        }
    }
}

const fetchJsonDataAsync = async(event) => {
    const fetchRequest = await fetch(event.request);
    const requestJson = await fetchRequest.clone().json();

    await clearAllData('todos');

    const promises = [];
    for(let key in requestJson) {      
        promises.push(writeData('todos', requestJson[key]));
    }

    try{
        await Promise.all(promises);
        return fetchRequest;
    }
    catch(err){
        console.error('Service Worker Error: ', err);
        throw err;
    }
}

self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetching items...');
    const url = 'http://localhost:3000/todos';

    if(event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetchJsonDataAsync(event)
        )
    }
    else if(isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    }
    else{
        event.respondWith(
            fetchResponse(event)
        )
    }
});



const syncNewTodo = async() => {
    const endpointUrl = 'http://localhost:7071/api/todos'
    const todos = await readAllData('todos-sync')
    for(let todo of todos){
        const fetchRes = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                description: todo.description,
                id: todo.id
            })
        })
        console.log('[Service Worker] Clearing Synced Todo from IndexedDB');
        if(fetchRes.ok){
            await deleteSingleItem('todos-sync' ,todo.id);
        }
    }
    return todos;
}

self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Syncing', event);
    if(event.tag === 'sync-new-todo') {
        console.log('[Service Worker] Syncing New Todos');
        event.waitUntil(
            syncNewTodo()
        )
    }
})

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
        console.log('Notification was confirmed');
    } else{
        notification.close();
        event.waitUntil(
            windowFocus(notification)
        )
    }

    notification.close();
});

self.addEventListener('notificationclose', (event) => {
    console.log('Notification was closed');
});

self.addEventListener('push', (event) => {
    let data = { title: 'New!', content: 'Something New Happened', openUrl: '/'};

    if(event.data){
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        icon: '/assets/144.png',
        badge: '/assets/144.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});