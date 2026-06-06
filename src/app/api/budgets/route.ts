import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Budget } from '@/types';

export async function GET() {
  try {
    const budgets = await db.getBudgets();
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const budget: Budget = await request.json();
    const newBudget = await db.addBudget(budget);
    return NextResponse.json({ success: true, data: newBudget });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedBudget = await db.updateBudget(id, updates);
    
    if (!updatedBudget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedBudget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update budget' },
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
        { success: false, error: 'Budget ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = await db.deleteBudget(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
