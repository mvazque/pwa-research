import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const tablesUrl = process.env.TABLE_URL ?? 'unknown';
const accountName = process.env.ACCOUNT_NAME ?? 'unknown';
const accountKey = process.env.ACCOUNT_KEY ?? 'unknown';

export async function postSubscription(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const tableName = "subscriptions";
    const sharedKeyCredential = new AzureNamedKeyCredential(accountName, accountKey);

    const client = new TableClient(
        tablesUrl,
        `${tableName}`,
        sharedKeyCredential
    );
    const bodyValue = JSON.parse(await request.text())
    console.log('BodyValue: ', bodyValue);

    await client.createTable();
    // console.log('After Table Creation')
    const entity = {
        partitionKey: "p1",
        rowKey: new Date().toISOString(),
        endpoint: bodyValue.endpoint,
        expirationTime: bodyValue.expirationTime,
        keys_p256dh: bodyValue.keys.p256dh,
        keys_auth: bodyValue.keys.auth,
    };

    console.log(entity);
    await client.createEntity(entity);


    return { body: JSON.stringify({response: 'Successfully saved subscription'}) , status: 201 };
};

app.http('postSubscription', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: postSubscription
});
