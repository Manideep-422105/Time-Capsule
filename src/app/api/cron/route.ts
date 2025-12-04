import { NextResponse } from "next/server";
import { dynamoClient } from "@/lib/dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize SES
const sesClient = new SESClient({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});

export async function GET(request: Request) {
  // 1. SECURITY CHECK (Prevent strangers from triggering this)
  // Vercel automatically adds this header when running a cron job
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // 2. QUERY DYNAMODB (Find capsules ready to open)
    // We look for items where type="CAPSULE" AND unlockDate is in the past
    // AND status is still "LOCKED" (so we don't email them twice)
    const params = {
      TableName: process.env.AUTH_DYNAMODB_TABLE,
      IndexName: "TimeIndex", // <--- The new index you created
      KeyConditionExpression: "#type = :type AND unlockDate <= :now",
      FilterExpression: "#status = :locked", // Only find locked ones
      ExpressionAttributeNames: {
        "#type": "type",
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":type": "CAPSULE",
        ":now": now,
        ":locked": "LOCKED",
      },
    };

    const { Items } = await dynamoClient.query(params);

    if (!Items || Items.length === 0) {
      return NextResponse.json({ message: "No capsules to unlock today." });
    }

    const emailPromises = Items.map(async (capsule) => {
      const emailCommand = new SendEmailCommand({
        Source: "manideep17072004@gmail.com",
        Destination: { ToAddresses: [capsule.recipientEmail] },
        Message: {
          Subject: { Data: `Time Capsule Unlocked: "${capsule.title}"` },
          Body: {
            Html: {
              Data: `
                <h1>The wait is over! 🔓</h1>
                <p>A memory sent by <strong>${
                  capsule.senderName || "Someone"
                }</strong> has just unlocked.</p>
                <p>It was buried on ${new Date(
                  capsule.createdAt
                ).toLocaleDateString()}.</p>
                <br/>
                <a href="${
                  process.env.NEXTAUTH_URL
                }" style="background: green; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Open Capsule Now
                </a>
              `,
            },
          },
        },
      });

      await sesClient.send(emailCommand);

      // B. Update Status to "UNLOCKED" (So we don't email again)
      // We need the original Primary Keys (pk, sk) to update
      const updateParams = {
        TableName: process.env.AUTH_DYNAMODB_TABLE,
        Key: { pk: capsule.pk, sk: capsule.sk },
        UpdateExpression: "SET #status = :unlocked",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":unlocked": "UNLOCKED" },
      };

      await dynamoClient.update(updateParams);
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      unlockedCount: Items.length,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
