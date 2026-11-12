import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ensureDefaultAdminAccounts } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mongooseInstance = await connectDB();
    const dbName = mongooseInstance.connection.name;
    const results = await ensureDefaultAdminAccounts();

    return NextResponse.json({
      success: true,
      message: 'MongoDB admin seats initialized and verified. Existing credentials safely preserved.',
      database: dbName,
      accounts: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Admin sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to sync admin accounts with MongoDB',
        hint: 'Check if MONGODB_URI is configured correctly and database connectivity is available.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
