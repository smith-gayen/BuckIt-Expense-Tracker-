import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Income } from '@/types';

export async function GET() {
  try {
    const income = await db.getIncome();
    return NextResponse.json({ success: true, data: income });
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch income' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const income: Income = await request.json();
    const newIncome = await db.addIncome(income);
    return NextResponse.json({ success: true, data: newIncome });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create income' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedIncome = await db.updateIncome(id, updates);
    
    if (!updatedIncome) {
      return NextResponse.json(
        { success: false, error: 'Income not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedIncome });
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update income' },
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
        { success: false, error: 'Income ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = await db.deleteIncome(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Income not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete income' },
      { status: 500 }
    );
  }
}
