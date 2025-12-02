import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { dynamoClient } from "@/lib/dynamodb";
import { Clock } from "lucide-react";
import DashboardClient from "@/app/components/DashboardClient"; // Import the Client UI

// --- DATA FETCHING (Keep this on server) ---
async function getSentCapsules(userId: string) {
  const params = {
    TableName: process.env.AUTH_DYNAMODB_TABLE,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":sk": "CAPSULE#" },
    ScanIndexForward: false,
  };
  const { Items } = await dynamoClient.query(params);
  return Items || [];
}

async function getReceivedCapsules(userEmail: string) {
  const params = {
    TableName: process.env.AUTH_DYNAMODB_TABLE,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `RECIPIENT#${userEmail}`,
      ":sk": "CAPSULE#",
    },
  };
  const { Items } = await dynamoClient.query(params);
  return Items || [];
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 1. LANDING PAGE (Not Logged In)
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black overflow-hidden relative">
        {/* Background glow effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
        </div>

        <div className="glass-panel p-10 rounded-3xl max-w-lg w-full flex flex-col items-center gap-8 relative z-10 border border-white/10 shadow-2xl">
          <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center mb-2 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Clock className="w-12 h-12 text-blue-400" />
          </div>
          <div>
            <h1 className="text-6xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse tracking-tighter">
                TimeVault
            </h1>
            <p className="text-gray-400 text-lg mt-4 font-light">
                Secure digital inheritance.<br/>Send a message to the future.
            </p>
          </div>
          
          <div className="flex gap-4 w-full mt-4">
            <Link
              href="/signup"
              className="flex-1 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED IN? FETCH DATA & RENDER DASHBOARD
  const sentCapsules = await getSentCapsules((session.user as any).id);
  const receivedCapsules = await getReceivedCapsules(session.user?.email!);

  return (
    <DashboardClient 
        // FIX: Added '!' to force TypeScript to accept it, OR use '|| {}'
        user={session.user!} 
        sent={sentCapsules} 
        received={receivedCapsules} 
    />
  );
}