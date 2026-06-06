import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Receipt } from '@/types';

export async function GET() {
  try {
    const receipts = await db.getReceipts();
    return NextResponse.json({ success: true, data: receipts });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const receipt: Receipt = await request.json();
    const newReceipt = await db.addReceipt(receipt);
    return NextResponse.json({ success: true, data: newReceipt });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedReceipt = await db.updateReceipt(id, updates);

    if (!updatedReceipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedReceipt });
  } catch (error) {
    console.error('Error updating receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update receipt' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Receipt ID is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteReceipt(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete receipt' },
      { status: 500 }
    );
  }
}
