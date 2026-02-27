import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AUTH_DYNAMODB_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AUTH_DYNAMODB_ID || "",
        secretAccessKey: process.env.AUTH_DYNAMODB_SECRET || "",
    }
});

async function main() {
    const command = new ScanCommand({
        TableName: process.env.AUTH_DYNAMODB_TABLE || "time-vault-auth",
        FilterExpression: "begins_with(pk, :pk) AND #t = :t",
        ExpressionAttributeNames: {
            "#t": "type"
        },
        ExpressionAttributeValues: {
            ":pk": { S: "USER#" },
            ":t": { S: "USER" },
        }
    });

    try {
        const response = await client.send(command);
        const users = response.Items?.map(i => unmarshall(i)).map(u => ({ email: u.email, isPremium: u.isPremium, id: u.id, pk: u.pk, sk: u.sk }));
        console.log("Users:\n", JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
