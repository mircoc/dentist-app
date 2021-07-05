
import { DynamoDB } from "aws-sdk";

async function getAllRecords(docClient, table): Promise<any[]> {
    let params = {
        TableName: table,
        ExclusiveStartKey: null,
    };
    let items = [];
    let data = await docClient.scan(params).promise();
    items = [...items, ...data.Items];
    while (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        data = await docClient.scan(params).promise();
        items = [...items, ...data.Items];
    }
    return items;
}
async function deleteItem(docClient, table, idKeys: Record<string, unknown>): Promise<void> {
    var params = {
        TableName: table,
        Key: {
            ...idKeys,
        },
    };

    return new Promise(function (resolve, reject) {
        docClient.delete(params, function (err, data) {
            if (err) {
                console.log("Error Deleting ", idKeys, err);
                reject(err);
            } else {
                console.log("Success Deleting ", idKeys, err);
                resolve();
            }
        });
    });
}

export async function clearTable(tableName: string, region: string, endpoint: string) {
    const docClient = new DynamoDB.DocumentClient({ region, endpoint });

    // scan and get all items
    const allRecords = await getAllRecords(docClient, tableName);
    // delete one by one
    for (const item of allRecords) {
        await deleteItem(docClient, tableName, {
            pk: item.pk,
            sk: item.sk,
        });
    }
}