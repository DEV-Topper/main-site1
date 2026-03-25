import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete('session_token');

  return NextResponse.json({ success: true });
}
