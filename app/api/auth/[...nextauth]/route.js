import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          console.log("Connecting to MongoDB...");
          await connectMongoDB();
          console.log("Connected to MongoDB");

          const user = await User.findOne({ email });

          if (!user) {
            console.log("No user found with this email");
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            console.log("Password does not match");
            return null;
          }

          console.log("User authenticated successfully");
          // Return user object with only required fields
          return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
          console.error("Error during authorization: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
