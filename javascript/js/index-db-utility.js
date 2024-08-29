
const dbPromise = idb.open('todos-store', 2, (db) => {
    if(!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', {keyPath: 'id'})
    }

    if(!db.objectStoreNames.contains('todos-sync')) {
        db.createObjectStore('todos-sync', {keyPath: 'id'})
    }
})

const writeData = async(st, data) => {
    const db = await dbPromise;
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
}

const readAllData = async(st) => {
    const db = await dbPromise;
    const tx = db.transaction(st, 'readonly');
    const store = tx.objectStore(st);
    return store.getAll();
}

const clearAllData = async(st) => {
    const db = await dbPromise;
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.clear();
    return tx.complete;
}

const deleteSingleItem = async(st, id) => {
    const db = await dbPromise;
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.delete(id);
    return tx.complete;
}

const urlBase64toUint8Array = (base64String) => {
    const padding = '='.repeat(( 4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for(let i = 0; i < rawData.length; i++ ){
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}