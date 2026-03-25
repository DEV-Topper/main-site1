import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';

export async function GET() {
  try {
    await connectDB();

    const accounts = await Account.find({ status: 'Available' })
      .select('platform subcategory')
      .lean();

    const tempMap: { [key: string]: string[] } = {};

    accounts.forEach((acc: any) => {
      const platform = (acc.platform || 'uncategorized').toLowerCase().trim();
      const normalizedPlatform = platform === 'twitter' ? 'x' : platform;
      const subcategory = acc.subcategory?.trim() || '';

      if (!tempMap[normalizedPlatform]) tempMap[normalizedPlatform] = [];
      if (subcategory && !tempMap[normalizedPlatform].includes(subcategory)) {
        tempMap[normalizedPlatform].push(subcategory);
      }
    });

    Object.keys(tempMap).forEach((platform) => {
      tempMap[platform].sort();
    });

    return NextResponse.json({ success: true, categories: tempMap });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}
