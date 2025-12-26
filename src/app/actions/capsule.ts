"use server";

import { dynamoClient } from "@/lib/dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 1. UPDATE: Import the combined AI function
import { processMessage } from "@/app/actions/ai";

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
    const getParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,

      Key: {
        pk: `USER#${userId}`,

        sk: `CAPSULE#${capsuleId}`,
      },
    };

    const { Item } = await dynamoClient.get(getParams);

    if (!Item) return { error: "Capsule not found" };

    if (Item.fileUrl) {
      const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`;

      const key = Item.fileUrl.replace(bucketUrl, "");

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,

          Key: key,
        })
      );
    }

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

export async function openCapsule(capsuleId: string, senderId: string) {
  const session = await getServerSession(authOptions);

  if (!session) return { error: "Unauthorized" };

  try {
    const getParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,

      Key: {
        pk: `USER#${senderId}`,

        sk: `CAPSULE#${capsuleId}`,
      },
    };

    const { Item } = await dynamoClient.get(getParams);

    if (!Item) return { error: "Capsule not found" };
    const now = new Date();
    const istOffeset=5.5*60*60*1000;
    const istTime=new Date(now.getTime()+istOffeset);
    const isUnlocked = istTime >= new Date(Item.unlockDate);

    if (!isUnlocked) return { error: "This capsule is still locked!" };

    const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`;

    const key = Item.fileUrl.replace(bucketUrl, "");

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,

      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const userParams = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,

      Key: { pk: `USER#${senderId}`, sk: `USER#${senderId}` },
    };

    const { Item: SenderProfile } = await dynamoClient.get(userParams);

    if (SenderProfile && SenderProfile.email) {
      const emailCommand = new SendEmailCommand({
        Source: "manideep17072004@gmail.com",

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
  const message = formData.get("message") as string;
  const file = formData.get("file") as File;

  try {
    // 1. AI SUMMARY GENERATION
    // We generate a summary now so it can be stored in the DB for the dashboard preview
    let aiSummary = "A mysterious message from the past...";
    if (message && message.length > 20) {
      const aiResult = await processMessage(message);
      if (aiResult && !("error" in aiResult)) {
        aiSummary = aiResult.summary || aiSummary;
      }
    }

    // 2. S3 UPLOAD
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${fileId}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // 3. DYNAMODB SAVE
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
        message: message || "",
        aiSummary: aiSummary, // NEW: Store the AI generated summary
        fileUrl: fileUrl,
        unlockDate: unlockDate,
        status: "LOCKED",
        createdAt: now,
      },
    };

    await dynamoClient.put(putParams);

    // 4. SEND EMAIL
    const emailCommand = new SendEmailCommand({
      Source: "manideep17072004@gmail.com",
      Destination: { ToAddresses: [recipientEmail] },
      Message: {
        Subject: { Data: `⏳ A Time Capsule is waiting for you!` },
        Body: {
          Html: {
            Data: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px;">
                <h1 style="color: #4F46E5;">⏳ Time Capsule Received</h1>
                <p><strong>${userName}</strong> has buried a memory for you.</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Title:</strong> ${title}</p>
                  <p><strong>Preview:</strong> <em>"${aiSummary}"</em></p>
                  <p><strong>Unlocks on:</strong> ${new Date(
                    unlockDate
                  ).toLocaleString()}</p>
                </div>
                <a href="${
                  process.env.NEXTAUTH_URL
                }" 
                   style="display: inline-block; background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   View Your Vault
                </a>
              </div>
            `,
          },
        },
      },
    });

    await sesClient.send(emailCommand);

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Capsule Creation Error:", error);
    return { error: error.message || "Failed to create time capsule" };
  }
}
