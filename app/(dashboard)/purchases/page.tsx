'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { X, Copy, Check } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Purchase {
  id: string;
  platform: string;
  followers: number;
  totalAmount: number;
  quantity: number;
  purchaseDate: string;
  credentials: string[] | any[];
  status?: string;
  type?: string;
}

export default function PurchasesPage() {
  const { formatAmount } = useCurrency();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch('/api/user/purchases');
        const data = await res.json();

        if (data.success && data.purchases) {
          setPurchases(data.purchases);
          const total = data.purchases.reduce(
            (sum: number, p: Purchase) => sum + (p.totalAmount || 0),
            0,
          );
          setTotalSpent(total);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const openPurchaseModal = (p: Purchase) => {
    setSelectedPurchase(p);
    setIsModalOpen(true);
    setCopiedIndex(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
    setCopiedIndex(null);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateStr);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getCredentialText = (cred: any): string => {
    if (typeof cred === 'string') {
      return cred;
    }

    if (typeof cred === 'object' && (cred.username || cred.password)) {
      return `Username: ${cred.username || '—'}\nPassword: ${cred.password || '—'}`;
    }

    return JSON.stringify(cred, null, 2);
  };

  const renderCredential = (cred: any, idx: number) => {
    const credentialText = getCredentialText(cred);
    const isCopied = copiedIndex === idx;

    return (
      <div
        key={idx}
        className="relative bg-card rounded-lg p-3 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <div className="pr-10">
          {typeof cred === 'string' ? (
            <div className="font-mono text-xs sm:text-sm bg-emerald-500/10 px-3 py-2 rounded break-all border border-emerald-500/20">
              <div className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">
                {cred}
              </div>
            </div>
          ) : typeof cred === 'object' && (cred.username || cred.password) ? (
            <div className="space-y-1">
              <div className="text-sm text-foreground">
                <span className="font-semibold">Username:</span>{' '}
                {cred.username || '—'}
              </div>
              <div className="text-sm text-foreground">
                <span className="font-semibold">Password:</span>{' '}
                {cred.password || '—'}
              </div>
            </div>
          ) : (
            <div className="font-mono text-xs sm:text-sm bg-muted/30 px-3 py-2 rounded break-all border border-border">
              <div className="text-foreground">{JSON.stringify(cred)}</div>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(credentialText, idx);
          }}
          className="absolute right-3 top-3 p-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="p-6 lg:p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Purchases
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your recent purchases and order details.
            </p>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <h3 className="text-sm text-muted-foreground text-opacity-80">Total Spent</h3>
              <div className="mt-2 text-xl font-semibold text-foreground">
                {formatAmount(totalSpent)}
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <h3 className="text-sm text-muted-foreground text-opacity-80">Orders</h3>
              <div className="mt-2 text-xl font-semibold text-foreground">
                {purchases.length}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchases found
              </div>
            ) : (
              purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-card rounded-xl p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition"
                  onClick={() => openPurchaseModal(purchase)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        Order #{purchase.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {purchase.platform} |{' '}
                        {purchase.followers?.toLocaleString() || '—'} followers
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDate(purchase.purchaseDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground text-opacity-80">
                        {purchase.status || 'Completed'}
                      </div>
                      <div className="font-semibold text-foreground">
                        {formatAmount(purchase.totalAmount || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && selectedPurchase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-black/10 dark:bg-black/30"
              style={{ perspective: 1200 }}
              onClick={closeModal}
            >
              <motion.div
                initial={{ 
                  y: "60vh", 
                  scale: 0.01, 
                  scaleX: 0.1, 
                  skewX: -30, 
                  skewY: 15,
                  opacity: 0, 
                  filter: "blur(20px)" 
                }}
                animate={{ 
                  y: 0, 
                  scale: 1, 
                  scaleX: 1, 
                  skewX: 0, 
                  skewY: 0,
                  opacity: 1, 
                  filter: "blur(0px)" 
                }}
                exit={{ 
                  y: "60vh", 
                  scale: 0.01, 
                  scaleX: 0.1, 
                  skewX: 20,
                  opacity: 0, 
                  filter: "blur(15px)" 
                }}
                transition={{ 
                  type: "spring", 
                  damping: 17, 
                  stiffness: 85,
                  mass: 1 
                }}
                style={{ transformOrigin: "bottom center" }}
                className="bg-card dark:bg-slate-900/90 dark:backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-xl font-bold text-foreground truncate">
                      Purchase #{selectedPurchase.id.slice(0, 8)}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground text-opacity-90">
                      {selectedPurchase.platform} — {selectedPurchase.quantity}{' '}
                      log(s)
                    </p>
                    {selectedPurchase.type && (
                      <p className="text-xs sm:text-sm text-primary font-medium">
                        Type: {selectedPurchase.type}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatDate(selectedPurchase.purchaseDate)}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      Your Credentials (
                      {selectedPurchase.credentials?.length || 0} items)
                    </h3>
                    {selectedPurchase.credentials &&
                      selectedPurchase.credentials.length > 0 && (
                        <button
                          onClick={() => {
                            const allText = selectedPurchase.credentials
                              .map(
                                (cred, idx) =>
                                  `Log ${idx + 1}:\n${getCredentialText(cred)}`,
                              )
                              .join('\n\n');
                            copyToClipboard(allText, -1);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition-colors w-full sm:w-auto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy All
                        </button>
                      )}
                  </div>

                  {selectedPurchase.credentials &&
                  selectedPurchase.credentials.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {selectedPurchase.credentials.map((cred, idx) =>
                        renderCredential(cred, idx),
                      )}
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
                      No credentials available for this purchase.
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </DashboardLayout>
  );
}
