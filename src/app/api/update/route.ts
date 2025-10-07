import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { value } = await request.json();  // Terima JSON { "value": 0 } atau { "value": 1 }
    
    if (typeof value !== 'number' || (value !== 0 && value !== 1)) {
      return NextResponse.json({ error: 'Invalid value. Must be 0 or 1.' }, { status: 400 });
    }

    // Simpan data ke Vercel KV: key = timestamp, value = data
    const timestamp = Date.now();
    await kv.set(`data:${timestamp}`, value);
    
    // Simpan riwayat: ambil 10 data terakhir (untuk display)
    const historyKey = 'data:history';
    let history = await kv.get<number[]>(historyKey) || [];
    history.unshift(value);  // Tambah di depan
    if (history.length > 10) history = history.slice(0, 10);  // Batasi 10
    await kv.set(historyKey, history);
    
    // Simpan data terbaru
    await kv.set('data:latest', value);
    
    return NextResponse.json({ success: true, value, timestamp });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}