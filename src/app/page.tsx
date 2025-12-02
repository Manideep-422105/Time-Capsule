import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { dynamoClient } from "@/lib/dynamodb";
import { Send, Inbox, Plus, Clock } from "lucide-react";
// IMPORT THE NEW COMPONENT
import CapsuleCard from "@/app/components/CapsuleCard";

// Helper functions
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

  const sentCapsules = session
    ? await getSentCapsules((session.user as any).id)
    : [];
  const receivedCapsules = session
    ? await getReceivedCapsules(session.user?.email!)
    : [];

  // 1. NOT LOGGED IN UI
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-10 rounded-2xl max-w-lg w-full flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
            <Clock className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Time Capsule
          </h1>
          <p className="text-gray-300 text-lg">
            Send a message to the future. Preserve memories for eternity.
          </p>
          <div className="flex gap-4 w-full mt-4">
            <Link
              href="/signup"
              className="flex-1 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/50"
            >
              Sign Up
            </Link>
            <Link
              href="/signin"
              className="flex-1 py-3 bg-gray-700/50 border border-gray-600 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
            {session.user?.name?.[0] || "U"}
          </div>
          <div>
            <h1 className="font-bold text-white">{session.user?.name}</h1>
            <p className="text-xs text-gray-400">{session.user?.email}</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* ACTION BAR */}
      <div className="flex justify-end mb-8">
        <Link
          href="/create"
          className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-500 hover:scale-105 shadow-lg shadow-blue-900/50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Bury New Memory
        </Link>
      </div>

      {/* RECEIVED SECTION */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Inbox className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Received Memories</h2>
        </div>

        {receivedCapsules.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center text-gray-500 border-dashed border-2 border-gray-700">
            No memories found in your mailbox.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* USE CAPSULE CARD COMPONENT */}
            {receivedCapsules.map((capsule: any) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                isReceived={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* SENT SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Send className="text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Sent Capsules</h2>
        </div>

        {sentCapsules.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center text-gray-500 border-dashed border-2 border-gray-700">
            You haven't buried any memories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* USE CAPSULE CARD COMPONENT */}
            {sentCapsules.map((capsule: any) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                isReceived={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}