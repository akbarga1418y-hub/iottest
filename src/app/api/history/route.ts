import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const history = await kv.get<number[]>('data:history') || [];
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
  }
}