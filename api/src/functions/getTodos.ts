import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const tablesUrl = process.env.TABLE_URL ?? 'unknown';
const accountName = process.env.ACCOUNT_NAME ?? 'unknown';
const accountKey = process.env.ACCOUNT_KEY ?? 'unknown';

export async function getTodos(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    const entities = client.listEntities();
    const response = [];
    for await (const entity of entities) {
        // @ts-ignore
        response.push({description: entity.description, completed: entity.completed, id: entity.rowKey, createdOn: entity.createdOn});
    }
    const sortedResponse = response.sort((a,b) => new Date(a.createdOn).valueOf() - new Date(b.createdOn).valueOf())
    return { body: JSON.stringify(sortedResponse) };
};

app.http('getTodos', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getTodos
});
