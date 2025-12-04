import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dynamoClient } from "@/lib/dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize SES (Email)
const sesClient = new SESClient({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get the User ID & Email from the session data
    const userId = session.metadata?.userId;
    const userEmail = session.customer_details?.email || session.customer_email;

    if (userId) {
      console.log(`✅ Upgrade User ${userId} to Premium`);

      // 1. UPDATE DYNAMODB: Set isPremium = true
      const updateParams = {
        TableName: process.env.AUTH_DYNAMODB_TABLE,
        Key: {
          pk: `USER#${userId}`,
          sk: `USER#${userId}`,
        },
        UpdateExpression: "SET isPremium = :true, updatedAt = :now",
        ExpressionAttributeValues: {
          ":true": true,
          ":now": new Date().toISOString(),
        },
      };

      await dynamoClient.update(updateParams);

      // 2. SEND WELCOME EMAIL (New Feature)
      if (userEmail) {
        try {
          const emailCommand = new SendEmailCommand({
            Source: "manideep17072004@gmail.com", // <--- YOUR VERIFIED EMAIL
            Destination: { ToAddresses: [userEmail] },
            Message: {
              Subject: { Data: `Welcome to Time Vault PRO! 🌟` },
              Body: {
                Html: {
                  Data: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
                        <h1 style="color: #d97706;">You are now a Pro Member! 🚀</h1>
                        <p>Thank you for upgrading. Your account has been instantly boosted.</p>
                        <h3>Your New Superpowers:</h3>
                        <ul>
                            <li>✅ <strong>10GB Storage Limit</strong> (Upload huge files!)</li>
                            <li>✅ <strong>4K Video Support</strong></li>
                            <li>✅ <strong>Priority AI Processing</strong></li>
                            <li>✅ <strong>Unlimited Summaries</strong></li>
                        </ul>
                        <p>Go create your first 4K memory now!</p>
                        <br/>
                        <a href="${process.env.NEXTAUTH_URL}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </div>
                  `,
                },
              },
            },
          });

          await sesClient.send(emailCommand);
          console.log(`📧 Sent Pro welcome email to ${userEmail}`);
        } catch (emailError) {
          console.error("Failed to send Pro email:", emailError);
          // We don't fail the request here, because the payment succeeded.
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}