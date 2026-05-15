import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
// import AppleProvider from 'next-auth/providers/apple'
// import EmailProvider from 'next-auth/providers/email'

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateUniqueUsername } from "@/lib/user/generateUniqueUsername";

export const authOptions = {
  providers: [
    // OAuth authentication providers...
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET
    // }),
    // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: 'NextAuth.js <no-reply@example.com>'
    // }),
  ],
  callbacks: {
    // SAVE NEW USERS TO MONGODB
    async signIn({ user, account }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });

      // Generate fallback name from email if name missing
      const generatedName =
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "user";

      // Final safe display name
      const safeName =
        user.name?.trim() ||
        generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

      if (!existingUser) {
        let newUser;

        // auto-generate username
        const baseUsername = safeName
          .toLowerCase()
          .replace(/\s+/g, "")
          .slice(0, 15);

        for (let i = 0; i < 5; i++) {
          try {
            const username = await generateUniqueUsername(baseUsername);

            // create new user
            newUser = await User.create({
              name: safeName,
              email: user.email,
              username,
              providers: [account.provider],
            });

            break;
          } catch (err) {
            if (err.code !== 11000) throw err;
          }
        }

        if (!newUser) throw new Error("Failed to create unique user");

        user.id = newUser._id.toString();

        return true;
      }

      let shouldSave = false;

      // Fix old users with missing names
      if (!existingUser.name || !existingUser.name.trim()) {
        existingUser.name = safeName;
        shouldSave = true;
      }

      // Add new provider if not present
      if (!existingUser.providers.includes(account.provider)) {
        existingUser.providers.push(account.provider);
        shouldSave = true;
      }

      if (shouldSave) await existingUser.save();

      user.id = existingUser._id.toString();

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id; // user.id set above
      }

      // when useSession().update() is called
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.name) token.name = session.name;
        if (session.bio) token.bio = session.bio;
      }
      return token;
    },

    // ATTACH DB USER DATA TO SESSION
    async session({ session, token }) {
      await connectDB();

      const dbUser = await User.findOne(
        { email: session.user.email },
        "username name bio providers",
      );

      session.user.id = token.id;

      // Prefer updated token values, fallback to DB
      session.user.username = token.username || dbUser.username;
      session.user.name = token.name || dbUser.name;
      session.user.bio = token.bio || dbUser.bio;

      session.user.providers = dbUser.providers;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
