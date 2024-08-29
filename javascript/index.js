const VAPID_PUBLIC_KEY = '{PUBLIC_KEY_GOES_HERE}';
if('serviceWorker' in navigator){
    console.log('Service worker will be registered');
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => {
            console.log('Service worker registered');
        })
}

const todoListContainer = document.getElementById('todo-list');
const clearTodoList = () => {
    
    while(todoListContainer.hasChildNodes()){
        todoListContainer.removeChild(todoListContainer.lastChild);
    }
}

const updateTodoList = (todoList) => {
    clearTodoList();
    for(let key in todoList){
        const todoItem = todoList[key];
        const listElement = document.createElement('li');
        listElement.id = todoItem.id;

        let input = document.createElement("input");
        input.type = "checkbox";
        input.checked = todoItem.completed

        let text = document.createTextNode(todoItem.description);
        listElement.appendChild(input);
        listElement.appendChild(text);
        todoListContainer.appendChild(listElement);
        
    }
}


let networkDataReceived = false;
const getList = async () => {
    if(!navigator.onLine){
        return;
    }

    try{
        const response = await fetch('http://localhost:3000/todos');
        const todoList = await response.json(); //extract JSON from the http response
        networkDataReceived = true;

        console.log('From Web', todoList);
        updateTodoList(todoList);
    }
    catch(err) {
        console.log('Error in the fetch from web app side: ', err);
    }
    
}

getList();



const getListFromCache = async () => {
    if(!('indexedDB' in window) || networkDataReceived)
    {
        return
    }

    const todos = await readAllData('todos')

    if(networkDataReceived){
        return 
    }
    console.log('From Cache', todos);
    updateTodoList(todos);
}

getListFromCache();



/**
 * Notification Items
 */
const displayConfirmNotification = async() => {
    if(!('serviceWorker' in navigator)){
        return;
    }
    const notifImg = `/assets/144.png`;
    // TODO LOOK INTO WHY previous tag didn't have notifications showing for some reason
    // Was there a notification previously somewhere I never closed so it was never overwritten?
    const options = {
        body: `Created by John Freeman. `,
        image: notifImg,
        icon: notifImg,
        dir: 'ltr',
        lang: 'en-US',
        vibrate: [100, 50, 200],
        badge: notifImg,
        // tag: 'confirm-notification-subscription',
        // renotify: true,
        actions: [
            { action: 'confirm', title: 'Okay', icon: notifImg },
            { action: 'cancel', title: 'Cancel', icon: notifImg}
        ]
    };

    const swRegistration = await navigator.serviceWorker.ready;
    swRegistration.showNotification('Successfully subscribed from Service Worker', options);
}

// const configurePushSub = () => {
//     if(!('serviceWorker' in navigator)){
//         return;
//     }

//     let registration;
//     navigator.serviceWorker.ready
//         .then((swRegistration) => {
//             registration = swRegistration;
//             return swRegistration.pushManager.getSubscription();
//         })
//         .then((sub) => {
//             if(sub === null){
//                 const convertedVapidPublicKey = urlBase64toUint8Array(VAPID_PUBLIC_KEY);
//                 return registration.pushManager.subscribe({
//                     userVisibleOnly: true,
//                     applicationServerKey: convertedVapidPublicKey
//                 })
//             }
//             else{
//                 return sub;
//             }
//         })
//         .then((newSub) => {
//             return fetch('http://localhost:3000/saveObject/subscriptions', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(newSub)
//             })
//         })
//         .then((res) => {
//             if(res.ok){
//                 displayConfirmNotification();
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//         })
// }

const configurePushSub = async() => {
    if(!('serviceWorker' in navigator)){
        return;
    }

    let registration;

    try{
        const swRegistration = await navigator.serviceWorker.ready;
        registration = swRegistration;

        let sub = await swRegistration.pushManager.getSubscription();
        if(sub === null){
            const convertedVapidPublicKey = urlBase64toUint8Array(VAPID_PUBLIC_KEY);
            sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidPublicKey
            })
        }

        const fetchResponse = await fetch('http://localhost:3000/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sub)
        })

        if(fetchResponse.ok){
            displayConfirmNotification();
        }
    } catch{(err) => {
        console.log(err);
    }};
}


const enableNotifications = (event) => {
    window.Notification.requestPermission().then((result) => {
        if (result === "granted") {
            configurePushSub();
        }
    });
}



/**
 * Background Sync
 */
const openTodoCreation = () => {
    const modal = document.getElementById('todo-creation-modal');
    modal.style.transform = 'translateY(0)';
}

const closeModal = () => {
    const modal = document.getElementById('todo-creation-modal');
    modal.style.transform = 'translateY(100vh)';
}

const todoDescription = document.getElementById('toDoDescription');
const sendTodo = async() => {
    const postResponse = await fetch('http://localhost:3000/todos', {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            description: todoDescription.value.trim(),
            id: new Date().toISOString()
        })
    });
    closeModal();
}

const submitTodo = async() => {    
    if(todoDescription.value.trim() === ""){
        alert("Don't leave the description bank");
        return;
    }
    
    if(!("serviceWorker" in navigator && 'SyncManager' in window)){
        sendTodo();
        return;
    }

    
    const sw = await navigator.serviceWorker.ready;
    let todo = {
        id: new Date().toISOString(),
        description: todoDescription.value.trim()
    }
    try {
        await writeData('todos-sync', todo)
        await sw.sync.register('sync-new-todo');
                alert('Your To Do was saved for syncing!');
                closeModal();
    }
    catch(err) {
        console.log(err);
    }
}


// https://dummyjson.com/docs/todos
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Installable_PWAs
// https://github.com/jakearchibald/idb
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push