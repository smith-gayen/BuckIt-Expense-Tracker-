import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { SavingsGoal } from '@/types';

export async function GET() {
  try {
    const goals = await db.getSavingsGoals();
    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch savings goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const goal: SavingsGoal = await request.json();
    const newGoal = await db.addSavingsGoal(goal);
    return NextResponse.json({ success: true, data: newGoal });
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create savings goal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedGoal = await db.updateSavingsGoal(id, updates);

    if (!updatedGoal) {
      return NextResponse.json(
        { success: false, error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedGoal });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update savings goal' },
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
        { success: false, error: 'Savings goal ID is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteSavingsGoal(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete savings goal' },
      { status: 500 }
    );
  }
}
