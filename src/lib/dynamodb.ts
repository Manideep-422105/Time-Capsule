import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
console.log("Debug Auth Check:", {
    hasId: !!process.env.AUTH_DYNAMODB_ID, // Should be true
    hasSecret: !!process.env.AUTH_DYNAMODB_SECRET, // Should be true
    region: process.env.AUTH_DYNAMODB_REGION
});
const config = {
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
  region: process.env.AUTH_DYNAMODB_REGION,
};

const client = new DynamoDBClient(config);
export const dynamoClient = DynamoDBDocument.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});