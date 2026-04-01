'use client';

import { useEffect, useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';

export default function ReferralsPage() {
  const { formatAmount } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'withdrawals'>('referrals');
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const copyToClipboard = (referralCode: string) => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied!');
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchUserData();
    fetchWithdrawals();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/referrals');
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/user/withdrawals');
      const data = await res.json();
      if (data.success) {
        setWithdrawalRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const openWithdrawModal = () => {
    setWithdrawBank('');
    setWithdrawAccountNumber('');
    setWithdrawAccountName('');
    setWithdrawAmount(String(userData?.referralBalance || 0));
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(withdrawAmount);
    if (!withdrawBank || !withdrawAccountNumber || !withdrawAccountName) {
      toast.error('Please fill in all bank details.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid withdrawal amount.');
      return;
    }
    if (amount < 1000) {
      toast.error(`Minimum withdrawal amount is ${formatAmount(1000)}.`);
      return;
    }
    const available = Number(userData?.referralBalance || 0);
    if (amount > available) {
      toast.error('Requested amount exceeds your referral balance.');
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const res = await fetch('/api/user/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bank: withdrawBank,
          accountNumber: withdrawAccountNumber,
          accountName: withdrawAccountName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Withdrawal request submitted. Status: pending.');
        setShowWithdrawModal(false);
        fetchUserData(); // Refresh balance
        fetchWithdrawals(); // Refresh requests
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Withdraw request error:', err);
      toast.error('Error creating withdraw request. Try again.');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          No user data found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 relative bg-background min-h-screen">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Referral Program</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-muted-foreground mb-2">Total Referrals</h3>
            <p className="text-3xl font-bold text-foreground">{userData.referrals.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-muted-foreground mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(userData.referralBalance || 0)}
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={openWithdrawModal}
                disabled={Number(userData.referralBalance || 0) < 1000}
                className={`w-full px-4 py-2 rounded-lg text-white ${Number(userData.referralBalance || 0) >= 1000
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                Withdraw Referral Balance
              </button>
              {Number(userData.referralBalance || 0) < 1000 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Minimum withdrawal: {formatAmount(1000)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Referral Code</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted p-4 rounded-lg font-mono text-foreground border border-border">
              {userData.referralCode || 'Not generated'}
            </div>
            <button
              onClick={() => copyToClipboard(userData.referralCode || '')}
              disabled={!userData.referralCode}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:bg-muted disabled:text-muted-foreground"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Referral Link</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted p-4 rounded-lg font-mono text-sm truncate">
              {userData.referralCode
                ? `${origin}/register?ref=${userData.referralCode}`
                : 'Not generated'}
            </div>
            <button
              onClick={() => {
                const link = `${origin}/register?ref=${userData.referralCode}`;
                navigator.clipboard.writeText(link);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
                toast.success('Referral link copied!');
              }}
              disabled={!userData.referralCode}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:bg-gray-400 whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="flex border-b border-border bg-muted/30">
            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'referrals'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Referrals History
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'withdrawals'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Withdrawal Requests
            </button>
          </div>

          <div className="p-6">
            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border text-muted-foreground">
                      <th className="pb-4">User</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {userData.referrals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No referrals yet
                        </td>
                      </tr>
                    ) : (
                      userData.referrals.map((referral: any, index: number) => (
                        <tr key={index} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="font-medium">{referral.username}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {new Date(referral.date).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${referral.earnings > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {referral.earnings > 0 ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4">
                            {formatAmount(referral.earnings || 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <div className="overflow-x-auto">
                {loadingRequests ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading requests...
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-border text-muted-foreground">
                        <th className="pb-4">Amount</th>
                        <th className="pb-4">Bank</th>
                        <th className="pb-4">Account</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {withdrawalRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No withdrawal requests yet
                          </td>
                        </tr>
                      ) : (
                        withdrawalRequests.map((request: any) => (
                          <tr
                            key={request._id || request.id}
                            className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-4 font-semibold">
                              {formatAmount(request.amount || 0)}
                            </td>
                            <td className="py-4">{request.bank}</td>
                            <td className="py-4">
                              <div className="text-sm">
                                <div>{request.accountName}</div>
                                <div className="text-gray-500">
                                  {request.accountNumber}
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Withdraw Referral Balance
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Bank</label>
                  <input
                    required
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full mt-1 p-2 bg-background border border-border rounded text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Account Number
                  </label>
                  <input
                    required
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                    className="w-full mt-1 p-2 bg-background border border-border rounded text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Account Name
                  </label>
                  <input
                    required
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Amount</label>
                  <input
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full mt-1 p-2 bg-background border border-border rounded text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatAmount(userData?.referralBalance || 0)}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleWithdrawSubmit(e);
                    }}
                    disabled={submittingWithdraw}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                  >
                    {submittingWithdraw ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
