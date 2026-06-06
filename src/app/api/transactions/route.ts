import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Simple audit log schema (local to this route). For production, move to src/models.
const TransactionLogSchema = new mongoose.Schema(
  {
    transaction_id: { type: String },
    payload: { type: Object },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'transaction_logs' }
);

const TransactionLogModel =
  mongoose.models.TransactionLog || mongoose.model('TransactionLog', TransactionLogSchema);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate minimal fields
    const { user_id, amount, category, occurred_at, note } = body || {};
    if (
      typeof user_id !== 'string' ||
      typeof amount !== 'number' ||
      typeof category !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid payload: require user_id (string), amount (number), category (string)' },
        { status: 400 }
      );
    }

    // Insert into Supabase table `transactions`
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id,
          amount,
          category,
          occurred_at: occurred_at ? new Date(occurred_at).toISOString() : new Date().toISOString(),
          note: note ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Best-effort: log raw payload to MongoDB for audit
    try {
      await connectDB();
      await TransactionLogModel.create({ transaction_id: data.id, payload: body });
    } catch (logErr) {
      // Do not fail request because of logging issues
      console.error('Mongo audit log failed', logErr);
    }

    return NextResponse.json({ transaction: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function GET() {
  // Fetch latest 20 transactions from Supabase (ordered desc by occurred_at)
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ transactions: data ?? [] });
}
