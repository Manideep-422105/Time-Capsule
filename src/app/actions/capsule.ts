"use server";

import { dynamoClient } from "@/lib/dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// 1. UPDATE IMPORTS
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3
const s3Client = new S3Client({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});

// Initialize SES (Email)
const sesClient = new SESClient({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});
export async function deleteCapsule(capsuleId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  try {
    // 1. Fetch the capsule to get the S3 Key
    const getParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      Key: {
        pk: `USER#${userId}`,
        sk: `CAPSULE#${capsuleId}`,
      },
    };
    const { Item } = await dynamoClient.get(getParams);

    if (!Item) return { error: "Capsule not found" };

    // 2. Delete file from S3
    if (Item.fileUrl) {
      const bucketUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/`;
      const key = Item.fileUrl.replace(bucketUrl, "");

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        })
      );
    }

    // 3. Delete from DynamoDB
    const deleteParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      Key: {
        pk: `USER#${userId}`,
        sk: `CAPSULE#${capsuleId}`,
      },
    };
    await dynamoClient.delete(deleteParams);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Failed to delete capsule" };
  }
}
// --- NEW FUNCTION 2: OPEN & NOTIFY (ECHO) ---
export async function openCapsule(capsuleId: string, senderId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    // 1. Fetch Capsule Data to verify ownership/timing
    const getParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      Key: {
        pk: `USER#${senderId}`, // The Sender owns the partition
        sk: `CAPSULE#${capsuleId}`,
      },
    };
    const { Item } = await dynamoClient.get(getParams);

    if (!Item) return { error: "Capsule not found" };

    // 2. Security Check: Is it actually unlocked?
    const isUnlocked = new Date() >= new Date(Item.unlockDate);
    if (!isUnlocked) return { error: "This capsule is still locked!" };

    // 3. Generate the Secure S3 Link
    const bucketUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/`;
    const key = Item.fileUrl.replace(bucketUrl, "");
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // 4. "ECHO": Fetch Sender Email to Notify them
    // We fetch the User ID to get their email
    const userParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      Key: { pk: `USER#${senderId}`, sk: `USER#${senderId}` },
    };
    const { Item: SenderProfile } = await dynamoClient.get(userParams);

    if (SenderProfile && SenderProfile.email) {
      // Send Email using SES
      const emailCommand = new SendEmailCommand({
        Source: "manideepreddy628@gmail.com", // Your verified email
        Destination: { ToAddresses: [SenderProfile.email] },
        Message: {
          Subject: { Data: `Your Time Capsule was just opened!` },
          Body: {
            Html: {
              Data: `
                    <h1>Echo Notification 🔔</h1>
                    <p>Your capsule <strong>"${
                      Item.title
                    }"</strong> was just opened by <strong>${
                session.user?.email || "Unknown User"
              }</strong>.</p>
                    <p>The memory has been delivered successfully.</p>
                `,
            },
          },
        },
      });
      // Send asynchronously
      sesClient.send(emailCommand).catch(console.error);
    }

    return { url: signedUrl };
  } catch (error) {
    console.error("Open Error:", error);
    return { error: "Failed to open capsule" };
  }
}
export async function createCapsule(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { error: "Unauthorized" };

  const userId = (session.user as any).id;
  const userName = session.user.name;
  const title = formData.get("title") as string;
  const unlockDate = formData.get("unlockDate") as string;
  const recipientEmail = formData.get("recipientEmail") as string;
  const spotifyTrackId = formData.get("spotifyTrackId") as string;
  const file = formData.get("file") as File;

  try {
    // 1. S3 UPLOAD
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${fileId}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // 2. DYNAMODB SAVE
    const capsuleId = uuidv4();
    const now = new Date().toISOString();

    const putParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      Item: {
        pk: `USER#${userId}`,
        sk: `CAPSULE#${capsuleId}`,
        GSI1PK: `RECIPIENT#${recipientEmail}`,
        GSI1SK: `CAPSULE#${capsuleId}`,
        type: "CAPSULE",
        id: capsuleId,
        title: title,
        spotifyTrackId: spotifyTrackId,
        recipientEmail: recipientEmail,
        senderName: userName,
        message: formData.get("message") || "",
        fileUrl: fileUrl,
        unlockDate: unlockDate,
        status: "LOCKED",
        createdAt: now,
      },
    };

    await dynamoClient.put(putParams);

    // 3. SEND EMAIL (Native AWS SDK way - No Nodemailer errors!)
    const emailCommand = new SendEmailCommand({
      Source: "manideep17072004@gmail.com", // <--- REPLACE WITH YOUR VERIFIED SENDER EMAIL
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: `You received a Time Capsule from ${userName}`,
        },
        Body: {
          Html: {
            Data: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
                            <h1>⏳ Time Capsule Received</h1>
                            <p><strong>${userName}</strong> has buried a memory for you.</p>
                            <p><strong>Title:</strong> ${title}</p>
                            <p><strong>Unlocks on:</strong> ${new Date(
                              unlockDate
                            ).toLocaleString()}</p>
                            <br/>
                            <p>You can view this capsule (once it unlocks) by logging in here:</p>
                            <a href="${
                              process.env.NEXTAUTH_URL ||
                              "http://localhost:3000"
                            }" style="background: blue; color: white; padding: 10px 20px; text-decoration: none;">View Time Capsule</a>
                        </div>
                    `,
          },
        },
      },
    });

    await sesClient.send(emailCommand);
  } catch (error: any) {
    console.error("Error:", error);
    return { error: error.message || "Failed to create time capsule" };
  }

  revalidatePath("/");
  // redirect("/");
  return { success: true };
}
