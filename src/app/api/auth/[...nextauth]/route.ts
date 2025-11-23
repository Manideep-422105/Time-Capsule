import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { dynamoClient } from "@/lib/dynamodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: DynamoDBAdapter(dynamoClient, { tableName: process.env.AUTH_DYNAMODB_TABLE }),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const params = {
          TableName: process.env.AUTH_DYNAMODB_TABLE,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
          ExpressionAttributeValues: {
            ":pk": `USER#${credentials.email}`,
            ":sk": `USER#${credentials.email}`,
          },
        };

        const { Items } = await dynamoClient.query(params);
        const user = Items?.[0];

        if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.pk.split("#")[1], name: user.name, email: user.email };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  // START OF ADDED SECTION
  pages: {
    signIn: '/signin', // <--- This tells NextAuth to use your custom page
  }
  // END OF ADDED SECTION
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };