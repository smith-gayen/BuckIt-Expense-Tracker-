import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST() {
  try {
    await db.initializeDefaultData();
    return NextResponse.json({ success: true, message: 'Default data initialized' });
  } catch (error) {
    console.error('Error initializing default data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize default data' },
      { status: 500 }
    );
  }
}
