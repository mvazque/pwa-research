import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const tablesUrl = process.env.TABLE_URL ?? 'unknown';
const accountName = process.env.ACCOUNT_NAME ?? 'unknown';
const accountKey = process.env.ACCOUNT_KEY ?? 'unknown';

interface TodoEntity {
    partitionKey: string;
    rowKey: string;
    description: string;  
    completed: boolean;
}


export async function updateTodoCompleted(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const parsedRequest = JSON.parse(await request.text());
    const description = parsedRequest.description;
    const id = parsedRequest.id;
    const completed = parsedRequest.completed;

    const tableName = "todos";
    const sharedKeyCredential = new AzureNamedKeyCredential(accountName, accountKey);

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

    const entity: TodoEntity = {
        partitionKey: "todos",
        rowKey: id,
        description: description,
        completed: true
    };

    // Getting the entity we just created should give us an entity similar to the one that we first inserted
    // but without a brand property
    const noBrandEntity = await client.getEntity<TodoEntity>(entity.partitionKey, entity.rowKey);

    // Now we update the price setting, the default update mode is "Merge" which will only update the properties
    // of the entity that are different to what is already stored, in this case we just need to update the price
    // so we can just send an entity with the partition and row keys plus the new price
    await client.updateEntity({
        partitionKey: noBrandEntity.partitionKey,
        rowKey: noBrandEntity.rowKey,
        description: description,
        completed: completed
    });

    return {  body: JSON.stringify({message: `Todo Has Been Updated`}), status: 201 };
};

app.http('updateTodoCompleted', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: updateTodoCompleted
});
