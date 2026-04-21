import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ChildPanel from '@/models/ChildPanel';
import Transaction from '@/models/Transaction';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';
import bcrypt from 'bcryptjs';

const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function addDomainToVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('Vercel credentials not configured. Skipping domain provisioning.');
    return { success: true };
  }

  try {
    const res = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_exists') {
        return { success: true };
      }
      console.error('Vercel domain add error:', data);
      return { success: false, error: data.error?.message || 'Vercel domain provisioning failed' };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Vercel API request failed:', err);
    return { success: false, error: err.message };
  }
}

export async function POST(req: Request) {
  try {
    const { domain, adminName, adminPassword } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.userId as any;
    const userId = user._id.toString();

    // 1. Validate inputs
    if (!domain || !adminName || !adminPassword) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Normalize domain (strip http/https and trailing slashes)
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase().trim();

    // 2. Check for unique domain
    const existingPanel = await ChildPanel.findOne({ domain: cleanDomain });
    if (existingPanel) {
      return NextResponse.json({ error: 'Domain is already registered' }, { status: 400 });
    }

    // 3. Check user balance (Price: $10.99 = ₦14,287)
    const priceInNaira = 14287;
    const priceInUsd = 10.99;

    if (user.walletBalance < priceInNaira) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ₦${priceInNaira.toLocaleString()} to purchase a child panel.` },
        { status: 400 }
      );
    }

    // 4. Hash admin password
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Debit user wallet
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: -priceInNaira } },
      { new: true }
    );

    // 6. Create Child Panel record
    const childPanel = await ChildPanel.create({
      userId: user._id,
      domain: cleanDomain,
      adminName,
      adminPassword: hashedAdminPassword,
      priceInUsd,
      priceInNaira,
      status: 'pending',
    });

    // 7. Create Transaction record
    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: priceInNaira,
      amountUSD: priceInUsd,
      status: 'successful',
      description: `Child Panel Subscription for ${cleanDomain}`,
      reference: childPanel._id.toString(),
    });

    // 8. Automatically register the domain on Vercel
    const vercelResult = await addDomainToVercel(cleanDomain);
    if (!vercelResult.success) {
      console.warn(`Vercel domain provisioning failed for ${cleanDomain}: ${vercelResult.error}. Panel created anyway.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Child panel request submitted successfully',
      domain: cleanDomain,
      vercelProvisioned: vercelResult.success,
      newBalance: updatedUser?.walletBalance,
    });

  } catch (error: any) {
    console.error('Child Panel Submission Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
