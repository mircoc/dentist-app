import AWS, { DynamoDB } from "aws-sdk";

export async function createTable(tableName: string, region: string, endpoint: string) {
    AWS.config.update({
        region,
        accessKeyId: "local",
        secretAccessKey: "local",
    });
    const dyn = new DynamoDB({ region, endpoint });
    try {
        await dyn
            .createTable({
                TableName: tableName,
                AttributeDefinitions: [
                    { AttributeName: "pk", AttributeType: "S" },
                    { AttributeName: "sk", AttributeType: "S" },
                ],
                KeySchema: [
                    { AttributeName: "pk", KeyType: "HASH" },
                    { AttributeName: "sk", KeyType: "RANGE" },
                ],
                BillingMode: "PAY_PER_REQUEST",
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
            })
            .promise();
        }
    catch (e) {
        if (e.code === "ResourceInUseException") {
            // table already exists...
        } else {
            console.error(e);
        }
    }
}

