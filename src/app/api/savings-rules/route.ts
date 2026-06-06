import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { SavingsRule } from '@/types';

export async function GET() {
  try {
    const rules = await db.getSavingsRules();
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching savings rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch savings rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rule: SavingsRule = await request.json();
    const newRule = await db.addSavingsRule(rule);
    return NextResponse.json({ success: true, data: newRule });
  } catch (error) {
    console.error('Error creating savings rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create savings rule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedRule = await db.updateSavingsRule(id, updates);

    if (!updatedRule) {
      return NextResponse.json(
        { success: false, error: 'Savings rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedRule });
  } catch (error) {
    console.error('Error updating savings rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update savings rule' },
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
        { success: false, error: 'Savings rule ID is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteSavingsRule(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Savings rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Savings rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete savings rule' },
      { status: 500 }
    );
  }
}
