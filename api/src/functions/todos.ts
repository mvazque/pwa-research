import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
const webPush = require('web-push');

const tablesUrl = process.env.TABLE_URL ?? 'unknown';
const accountName = process.env.ACCOUNT_NAME ?? 'unknown';
const accountKey = process.env.ACCOUNT_KEY ?? 'unknown';
const publicKey = process.env.PUBLIC_KEY ?? 'unknown';
const privateKey = process.env.PRIVATE_KEY ?? 'unknown';

interface TodoEntity {
    partitionKey: string;
    rowKey: string;
    description: string;  
    completed: boolean;
    createdOn: string;
}

async function sendNotifications(){
    const tableName = "subscriptions";
    const sharedKeyCredential = new AzureNamedKeyCredential(accountName, accountKey);
    webPush.setVapidDetails('mailto:person@place.com', publicKey, privateKey)

    const client = new TableClient(
        tablesUrl,
        `${tableName}`,
        sharedKeyCredential
    );
    // calling create table will create the table used
    // to instantiate the TableClient.
    // Note: If the table already
    // exists this function doesn't throw.
    await client.createTable();

    const notification = {
        title: 'Created a new Todo',
        body: 'New Todo was added to the system!',
        image: '/assets/icons/icon-144x144.png',
        badge: '/assets/icons/icon-144x144.png',
        icon: '/assets/icons/icon-144x144.png',
        vibrate: [100, 50, 200],
        actions: [
          { action: 'confirm', title: 'Okay', icon: '/assets/icons/icon-144x144.png' },
          { action: 'cancel', title: 'Cancel', icon: '/assets/icons/icon-144x144.png'}
        ],
        data: {
          url: '/'
        }
    };

    const entities = client.listEntities();
    for await (const entity of entities) {
        
        if(!entity.endpoint){
            return;
        }
        let pushConfig = {
            endpoint: entity.endpoint,
            keys: {
                auth: entity.keys_auth,
                p256dh: entity.keys_p256dh
            }
        };

        webPush.sendNotification(pushConfig, JSON.stringify({
            notification: notification
        }))
        .catch(function(err) {
            console.log(err);
        })

    }

}

export async function postTodo(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const tableName = "todos";
    const sharedKeyCredential = new AzureNamedKeyCredential(accountName, accountKey);

    const client = new TableClient(
        tablesUrl,
        `${tableName}`,
        sharedKeyCredential
    );
    const parsedRequest = JSON.parse(await request.text());
    const description = parsedRequest.description;
    const id = parsedRequest.id;
    const completed = parsedRequest.completed ? parsedRequest.completed : false;
    // calling create table will create the table used
    // to instantiate the TableClient.
    // Note: If the table already
    // exists this function doesn't throw.
    await client.createTable();

    const entity = {
        partitionKey: "todos",
        rowKey: id,
        description,
        completed
    };
    let sendNotificationsBool = true;

    try{
        const noBrandEntity = await client.getEntity<TodoEntity>(entity.partitionKey, entity.rowKey);
        sendNotificationsBool = false;
    }
    catch{
        // @ts-ignore
        entity.createdOn = new Date().toISOString();
    }
    
    await client.upsertEntity(entity);

    if(sendNotificationsBool){
        sendNotifications();
    }
    

    return { body: JSON.stringify({message: `Todo Upserted`}), status: 201 };
};

app.http('todos', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: postTodo
});
