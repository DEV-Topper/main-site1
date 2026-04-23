import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: "Webhook path is working!" });
}

export async function POST() {
  return NextResponse.json({ message: "OK" }, { status: 200 });
}
