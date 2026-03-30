import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import { getSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId._id.toString();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const options = {
      page,
      limit,
      sort: { purchaseDate: -1 },
      lean: true,
    };

    const query = { userUUID: userId };

    const result = await Purchase.paginate(query, options);

    const formattedPurchases = result.docs.map((p: any) => ({
      id: p._id.toString(),
      platform: p.platform,
      followers: p.followers || 0, // Use actual followers from database
      quantity: p.quantity,
      totalAmount: p.totalAmount,
      purchaseDate: p.purchaseDate,
      status: p.status,
      credentials: p.credentials || [],
      type: p.type || '', // Include account type
    }));

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      },
    });
  } catch (error: any) {
    console.error('Purchases fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 },
    );
  }
}
