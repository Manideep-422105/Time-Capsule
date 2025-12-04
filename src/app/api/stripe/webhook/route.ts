import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dynamoClient } from "@/lib/dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get the User ID we sent in the metadata
    const userId = session.metadata?.userId;

    if (userId) {
      console.log(`✅ Upgrade User ${userId} to Premium`);

      // UPDATE DYNAMODB: Set isPremium = true
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
    }
  }

  return NextResponse.json({ received: true });
}