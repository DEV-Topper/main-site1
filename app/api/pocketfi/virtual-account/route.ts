import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PocketfiVirtualAccount from '@/models/PocketfiVirtualAccount';
import User from '@/models/User';

const POCKETFI_API_BASE = 'https://api.pocketfi.ng/api/v1';

interface CreateVaRequestBody {
  userId?: string;
  bank?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await connectDB();

    const existing = await PocketfiVirtualAccount.findOne({ userId });

    if (!existing) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ 
      exists: true, 
      id: existing._id.toString(),
      ...existing.toObject() 
    }, { status: 200 });
  } catch (error) {
    console.error('PocketFi VA GET error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateVaRequestBody;
    const userId = (body.userId || '').toString().trim();
    const bodyFirstName = (body.firstName || '').toString().trim();
    const bodyLastName = (body.lastName || '').toString().trim();
    const bodyPhone = (body.phone || '').toString().trim();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await connectDB();

    const apiToken = process.env.POCKETFI_API_TOKEN;
    const businessId = process.env.POCKETFI_BUSINESS_ID;
    const defaultBank = process.env.POCKETFI_VA_BANK || 'kuda';

    if (!apiToken || !businessId) {
      return NextResponse.json(
        { error: 'PocketFi is not configured' },
        { status: 500 }
      );
    }

    // If a VA already exists, just return it
    const existing = await PocketfiVirtualAccount.findOne({ userId });
    if (existing) {
      return NextResponse.json(
        { created: false, id: existing._id.toString(), ...existing.toObject() },
        { status: 200 }
      );
    }

    // Read user profile for KYC-like details
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found for virtual account creation' },
        { status: 400 }
      );
    }

    const email = (user.email || '').toString().trim();
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required to create a virtual account' },
        { status: 400 }
      );
    }

    const fullName = (user.username || '').toString().trim();
    const profilePhone = (user.phone || '').toString().trim();

    const nameParts = fullName.split(' ').filter(Boolean);
    const defaultFirstName = nameParts[0] || 'Customer';
    const defaultLastName = nameParts.slice(1).join(' ') || 'User';

    const firstName = bodyFirstName || defaultFirstName;
    const lastName = bodyLastName || defaultLastName;
    const phone = bodyPhone || profilePhone;

    const bank = (body.bank || defaultBank).toString().trim() || defaultBank;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined,
      email,
      businessId: String(businessId),
      bank,
    };
    console.debug('PocketFi create virtual account payload', payload);

    const res = await fetch(`${POCKETFI_API_BASE}/virtual-accounts/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (
      !res.ok ||
      !data ||
      !data.status ||
      !Array.isArray(data.banks) ||
      !data.banks[0]
    ) {
      console.error('PocketFi create virtual account error', data);
      return NextResponse.json(
        {
          error: 'Unable to create PocketFi virtual account',
          details: data || null,
        },
        { status: 502 }
      );
    }

    const bankInfo = data.banks[0];
    const bankName = String(bankInfo.bankName || '');
    const accountNumber = String(bankInfo.accountNumber || '');
    const accountName = String(bankInfo.accountName || '');

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        {
          error: 'Invalid response from PocketFi when creating virtual account',
          details: data || null,
        },
        { status: 502 }
      );
    }

    const newVa = await PocketfiVirtualAccount.create({
      userId,
      businessId: String(businessId),
      bank,
      bankName,
      accountNumber,
      accountName,
      provider: 'pocketfi',
      status: 'active',
    });

    return NextResponse.json(
      { 
        created: true, 
        id: newVa._id.toString(), 
        ...newVa.toObject() 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PocketFi VA POST error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
