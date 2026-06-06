import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function GET() {
  try {
    // Minimal request to verify Supabase connectivity and auth
    const { error } = await supabase.from('transactions').select('id').limit(1);
    if (error) {
      return NextResponse.json(
        { ok: false, service: 'supabase', error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, service: 'supabase' });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, service: 'supabase', error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
