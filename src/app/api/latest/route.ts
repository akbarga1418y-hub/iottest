import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const value = await kv.get<number>('data:latest');
    return NextResponse.json({ value: value ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching latest data' }, { status: 500 });
  }
}
