import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AUTH_DYNAMODB_REGION,
    credentials: {
        accessKeyId: process.env.AUTH_DYNAMODB_ID || "",
        secretAccessKey: process.env.AUTH_DYNAMODB_SECRET || "",
    }
});

async function main() {
    const command = new ScanCommand({
        TableName: process.env.AUTH_DYNAMODB_TABLE,
    });

    try {
        const response = await client.send(command);
        const items = response.Items?.map(i => unmarshall(i)) || [];
        const users = items.filter(i => i.pk?.startsWith("USER#") && i.sk?.startsWith("USER#"));
        console.log("Users:", JSON.stringify(users.map(u => ({ email: u.email, isPremium: u.isPremium, id: u.id, pk: u.pk, sk: u.sk })), null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
