import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Expense } from '@/types';

export async function GET() {
  try {
    const expenses = await db.getExpenses();
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense: Expense = await request.json();
    const newExpense = await db.addExpense(expense);
    return NextResponse.json({ success: true, data: newExpense });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedExpense = await db.updateExpense(id, updates);
    
    if (!updatedExpense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expense' },
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
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = await db.deleteExpense(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
