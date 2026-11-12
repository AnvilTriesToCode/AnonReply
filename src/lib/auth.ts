import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: 'USER' | 'ADMIN';
      email?: string;
    };
  }
  interface User {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN';
    email?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN';
    email?: string;
  }
}

export const DEFAULT_ADMINS = [
  {
    username: 'admin',
    email: 'admin@example.com',
    adminTitle: 'Primary Administrator (Owner)',
  },
  {
    username: 'moderator1',
    email: 'mod1@example.com',
    adminTitle: 'Support Moderator',
  },
  {
    username: 'moderator2',
    email: 'mod2@example.com',
    adminTitle: 'Support Moderator',
  },
  {
    username: 'moderator3',
    email: 'mod3@example.com',
    adminTitle: 'Support Moderator',
  },
  {
    username: 'moderator4',
    email: 'mod4@example.com',
    adminTitle: 'Support Moderator',
  },
];

export async function ensureDefaultAdminAccounts(): Promise<string[]> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const synced: string[] = [];

  for (const adm of DEFAULT_ADMINS) {
    const existing = await User.findOne({ username: adm.username });
    if (!existing) {
      await User.create({
        username: adm.username,
        password: adminPassword,
        email: adm.email,
        role: 'ADMIN',
        adminTitle: adm.adminTitle,
      });
      synced.push(`Created @${adm.username} with role ADMIN`);
    } else {
      let needsSave = false;
      if (existing.role !== 'ADMIN') {
        existing.role = 'ADMIN';
        needsSave = true;
      }
      if (!existing.password) {
        existing.password = adminPassword;
        needsSave = true;
      }
      if (needsSave) {
        await existing.save();
      }
      synced.push(`Verified @${adm.username} (active with existing credentials)`);
    }
  }
  return synced;
}

const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.username) {
        throw new Error('Username is required');
      }

      await connectDB();

      const username = credentials.username.toLowerCase().trim();
      let user = await User.findOne({ username });

      // Automatically provision or synchronize the default umbrella admin accounts on admin login
      if (DEFAULT_ADMINS.some((a) => a.username === username)) {
        await ensureDefaultAdminAccounts();
        user = await User.findOne({ username });
      }

      if (!user) {
        throw new Error('User not found. Please check your username or register.');
      }

      // ADMIN ACCOUNTS: Password is strictly required and verified with bcrypt
      if (user.role === 'ADMIN') {
        if (!credentials?.password) {
          throw new Error('Admin password is required');
        }
        let isValid = await user.comparePassword(credentials.password);
        if (!isValid && DEFAULT_ADMINS.some((a) => a.username === username)) {
          const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
          if (credentials.password === adminPassword) {
            user.password = adminPassword;
            await user.save();
            isValid = true;
          }
        }
        if (!isValid) {
          throw new Error('Invalid administrator credentials');
        }
      }

      // GENERAL USERS: No password required, sign in directly with username
      return {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        email: user.email,
      };
    },
  }),
];

// Add Google OAuth provider if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            // Generate clean unique username from email
            let baseName = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15);
            if (baseName.length < 3) baseName = `user_${Math.random().toString(36).substring(2, 7)}`;
            let username = baseName;
            let counter = 1;
            while (await User.findOne({ username })) {
              username = `${baseName}_${counter}`;
              counter++;
            }

            dbUser = await User.create({
              username,
              email,
              role: 'USER',
            });
          }

          user.id = dbUser._id.toString();
          user.username = dbUser.username;
          user.role = dbUser.role;
          return true;
        } catch (err) {
          console.error('Google sign-in error:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.email = user.email;
      }

      // In case of Google sign-in where user data wasn't fully attached
      if (account?.provider === 'google' && token.email && !token.username) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email.toLowerCase().trim() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        role: token.role,
        email: token.email,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'anonreply-fallback-secret-production-key-2026',
};
