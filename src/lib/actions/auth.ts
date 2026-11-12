'use server';

import connectDB from '@/lib/db';
import User from '@/lib/models/User';

interface RegisterResult {
  success: boolean;
  error?: string;
  username?: string;
}

function formatAuthError(error: any, fallbackMessage: string): string {
  if (!process.env.MONGODB_URI) {
    return 'Database connection string (MONGODB_URI) is not configured in Vercel Environment Variables.';
  }
  const msg = error?.message || '';
  if (msg.includes('MONGODB_URI')) {
    return 'Database connection string (MONGODB_URI) is not configured in Vercel Environment Variables.';
  }
  if (
    error?.name === 'MongooseServerSelectionError' ||
    msg.includes('buffering timed out') ||
    msg.includes('connect ECONNREFUSED')
  ) {
    return 'Could not connect to MongoDB. Ensure "0.0.0.0/0" (Allow Access from Anywhere) is active in MongoDB Atlas Network Access.';
  }
  if (error?.code === 18 || msg.includes('Authentication failed') || msg.includes('bad auth')) {
    return 'MongoDB authentication failed. Please verify your database user and password in MONGODB_URI.';
  }
  return error?.message || fallbackMessage;
}

/**
 * Passwordless registration for general users
 */
export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const username = (formData.get('username') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  // Validation
  if (!username) {
    return { success: false, error: 'Username is required' };
  }

  if (username.length < 3 || username.length > 30) {
    return { success: false, error: 'Username must be between 3 and 30 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, error: 'Please provide a valid email address' };
  }

  try {
    await connectDB();

    // Protect reserved admin usernames
    const adminUsernames = ['admin', 'moderator1', 'moderator2', 'moderator3', 'moderator4'];
    if (adminUsernames.includes(username.toLowerCase())) {
      return { success: false, error: 'This username is reserved for administration.' };
    }

    // Check uniqueness explicitly
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return { success: false, error: 'Username is already taken. Please choose another one.' };
    }

    await User.create({
      username: username.toLowerCase(),
      email: email || undefined,
      role: 'USER',
    });

    return { success: true, username: username.toLowerCase() };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: 'Username is already taken' };
    }
    console.error('Registration error:', error);
    return { success: false, error: formatAuthError(error, 'Registration failed. Please try again.') };
  }
}

/**
 * Instant Guest / Service Account Generator:
 * Generates an anonymous account on the fly without manual form entry.
 */
export async function createInstantUser(): Promise<RegisterResult> {
  try {
    await connectDB();

    let username = '';
    let isUnique = false;
    let attempts = 0;

    // Generate unique random guest username (e.g. anon_839215)
    while (!isUnique && attempts < 10) {
      attempts++;
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      username = `anon_${randomSuffix}`;
      const existing = await User.findOne({ username });
      if (!existing) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      username = `anon_${Date.now().toString().slice(-6)}`;
    }

    await User.create({
      username,
      role: 'USER',
    });

    return { success: true, username };
  } catch (error: any) {
    console.error('Instant user creation error:', error);
    return {
      success: false,
      error: formatAuthError(error, 'Failed to generate instant account. Please try again.'),
    };
  }
}
