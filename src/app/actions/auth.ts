"use server";

import { dynamoClient } from "@/lib/dynamodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) throw new Error("Missing fields");

  // 1. Check if user exists
  const checkParams = {
    TableName: process.env.AUTH_DYNAMODB_TABLE,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
    ExpressionAttributeValues: {
      ":pk": `USER#${email}`,
      ":sk": `USER#${email}`,
    },
  };
  
  const { Items } = await dynamoClient.query(checkParams);
  if (Items && Items.length > 0) {
    return { error: "User already exists" };
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const now = new Date().toISOString();

  // 3. Insert User conforming to Adapter Schema
  // pk/sk = USER#<uuid>, GSI1PK/SK = USER#<email>
  const putParams = {
    TableName: process.env.AUTH_DYNAMODB_TABLE,
    Item: {
      pk: `USER#${userId}`,
      sk: `USER#${userId}`,
      GSI1PK: `USER#${email}`,
      GSI1SK: `USER#${email}`,
      type: "USER",
      id: userId,
      name: name,
      email: email,
      password: hashedPassword, // Custom field for credentials login
      createdAt: now,
      updatedAt: now,
    },
  };

  try {
    await dynamoClient.put(putParams);
    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Registration failed" };
  }
}