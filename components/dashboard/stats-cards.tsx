'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, CreditCard, Gem } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export function StatsCards() {
  const { currency, formatAmount, usdRate } = useCurrency();
  const [totalSpent, setTotalSpent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch User Data for Balances
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setBalance(userData.user.walletBalance || 0);
          setReferralBalance(userData.user.referralBalance || 0);
        }

        // Fetch Purchases for Total Spent
        const purchasesRes = await fetch('/api/user/purchases');
        const purchasesData = await purchasesRes.json();

        if (purchasesData.success) {
          const purchases = purchasesData.purchases || [];
          const total = purchases.reduce(
            (acc: number, curr: any) => acc + (curr.totalAmount || 0),
            0
          );
          setTotalSpent(total);
        }
        /* 
          Exchange rate is now managed globally by CurrencyProvider
        */
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
      {/* Total Balance Card */}
      <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
              <svg
                className="w-4 h-4 md:w-6 md:h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground">
                Total Balance
              </div>
              <div className="text-lg md:text-2xl font-bold text-foreground leading-tight">
                {formatAmount(balance)}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                {currency === 'NGN' ? (
                  `≈ $${(balance / usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                ) : (
                  `≈ ₦${balance.toLocaleString()} NGN`
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = '/add-funds')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm px-3 md:px-4 h-8 md:h-10 rounded-lg md:rounded-xl flex-shrink-0"
          >
            Fund Wallet
          </Button>
        </div>
      </div>

      {/* Total Spent Card */}
      <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
            <CreditCard color="currentColor" className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm text-muted-foreground">Total Spent</div>
            <div className="text-lg md:text-2xl font-bold text-foreground">
              {formatAmount(totalSpent)}
            </div>
            {/* <div className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
              {currency === 'NGN' ? (
                `≈ $${(totalSpent / usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
              ) : (
                `≈ ₦${totalSpent.toLocaleString()} NGN`
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* Referral Balance Card */}
      <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
              <Gem color="currentColor" className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground">
                Referral Balance
              </div>
              <div className="text-lg md:text-2xl font-bold text-foreground">
                {formatAmount(referralBalance)}
              </div>
              {/* <div className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
                {currency === 'NGN' ? (
                  `≈ $${(referralBalance / usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                ) : (
                  `≈ ₦${referralBalance.toLocaleString()} NGN`
                )}
              </div> */}
            </div>
          </div>
          <Link href="/referrals">
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
