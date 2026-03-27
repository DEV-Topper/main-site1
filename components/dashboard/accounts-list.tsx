'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Instagram,
  Facebook,
  Linkedin,
  Mic,
  Shield,
  MoreHorizontal,
  X,
  Mail,
  Users,
  DollarSign,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Wallet,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { BsSnapchat } from 'react-icons/bs';
import {
  FaDiscord,
  FaPinterest,
  FaQuora,
  FaReddit,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { FaTelegramPlane } from 'react-icons/fa';

interface Account {
  id: string;
  platform: string;
  subcategory?: string;
  followers: number;
  mailIncluded: boolean;
  vpnType?: string;
  description?: string;
  status: string;
  price: number;
  olaz?: string;
  logs: number;
  position?: number;
  createdAt: string;
  files?: string[];
}

interface AccountsListProps {
  selectedPlatform: string;
  userUUID?: string;
  selectedCategory?: string;
}

interface PlatformGroup {
  platformName: string;
  platformKey: string;
  subcategories: {
    [subcategory: string]: Account[];
  };
}

const getPlatformIcon = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig') || p === 'instagram')
    return Instagram;
  if (p.includes('facebook') || p.includes('fb') || p === 'facebook')
    return Facebook;
  if (p.includes('tiktok') || p.includes('tik tok') || p === 'tiktok')
    return FaTiktok;
  if (p.includes('x') || p.includes('twitter') || p === 'twitter' || p === 'x')
    return FaXTwitter;
  if (p.includes('linkedin') || p === 'linkedin') return Linkedin;
  if (p.includes('google') || p.includes('voice') || p === 'google voice')
    return Mic;
  if (p.includes('snapchat') || p.includes('snap') || p === 'snapchat')
    return BsSnapchat;
  if (p.includes('youtube') || p.includes('video') || p === 'youtube')
    return FaYoutube;
  if (p.includes('telegram') || p.includes('tele') || p === 'telegram')
    return FaTelegramPlane;
  if (p.includes('discord') || p === 'discord') return FaDiscord;
  if (
    p.includes('mail') ||
    p.includes('email') ||
    p.includes('gmail') ||
    p.includes('email') ||
    p.includes('mail.com')
  )
    return Mail;
  if (p.includes('pinterest') || p === 'pinterest') return FaPinterest;
  if (p.includes('quora') || p === 'quora') return FaQuora;
  if (p.includes('reddit') || p === 'reddit') return FaReddit;
  if (
    p.includes('textplus') ||
    p.includes('text plus') ||
    p.includes('text+') ||
    p === 'textplus'
  )
    return Mail;
  if (p.includes('twitch') || p === 'twitch') return FaTwitch;
  if (p.includes('vpn') || p === 'vpn') return Shield;
  return MoreHorizontal;
};

const getPlatformGradient = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig') || p === 'instagram')
    return 'from-purple-500 via-pink-500 to-orange-400';
  if (p.includes('facebook') || p.includes('fb') || p === 'facebook')
    return 'from-blue-600 to-blue-500';
  if (p.includes('tiktok') || p.includes('tik tok') || p === 'tiktok')
    return 'from-black via-red-500 to-blue-400';
  if (p.includes('x') || p.includes('twitter') || p === 'twitter' || p === 'x')
    return 'from-gray-900 to-gray-700';
  if (p.includes('linkedin') || p === 'linkedin')
    return 'from-blue-700 to-blue-600';
  if (p.includes('google') || p.includes('voice') || p === 'google voice')
    return 'from-blue-500 via-red-500 to-yellow-500';
  if (p.includes('snapchat') || p.includes('snap') || p === 'snapchat')
    return 'from-yellow-400 to-yellow-300';
  if (p.includes('youtube') || p.includes('video') || p === 'youtube')
    return 'from-red-600 to-red-500';
  if (p.includes('telegram') || p.includes('tele') || p === 'telegram')
    return 'from-blue-600 to-blue-500';
  if (p.includes('discord') || p === 'discord')
    return 'from-indigo-500 to-indigo-600';
  if (
    p.includes('mail') ||
    p.includes('email') ||
    p.includes('gmail') ||
    p.includes('email')
  )
    return 'from-orange-500 to-orange-400';
  if (p.includes('pinterest') || p === 'pinterest')
    return 'from-red-700 to-red-600';
  if (p.includes('quora') || p === 'quora') return 'from-red-700 to-red-500';
  if (p.includes('reddit') || p === 'reddit')
    return 'from-orange-500 to-orange-400';
  if (
    p.includes('textplus') ||
    p.includes('text plus') ||
    p.includes('text+') ||
    p === 'textplus'
  )
    return 'from-emerald-500 to-emerald-400';
  if (p.includes('twitch') || p === 'twitch')
    return 'from-purple-700 to-purple-500';
  if (p.includes('vpn') || p === 'vpn') return 'from-green-600 to-green-500';
  return 'from-gray-600 to-gray-500';
};

const getPlatformDisplayName = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig') || p === 'instagram')
    return 'Instagram';
  if (p.includes('facebook') || p.includes('fb') || p === 'facebook')
    return 'Facebook';
  if (p.includes('tiktok') || p.includes('tik tok') || p === 'tiktok')
    return 'TikTok';
  if (p.includes('x') || p.includes('twitter') || p === 'twitter' || p === 'x')
    return 'X (Twitter)';
  if (p.includes('linkedin') || p === 'linkedin') return 'LinkedIn';
  if (p.includes('google') || p.includes('voice') || p === 'google voice')
    return 'Google Voice';
  if (p.includes('snapchat') || p.includes('snap') || p === 'snapchat')
    return 'Snapchat';
  if (p.includes('youtube') || p.includes('video') || p === 'youtube')
    return 'YouTube';
  if (p.includes('telegram') || p.includes('tele') || p === 'telegram')
    return 'Telegram';
  if (p.includes('discord') || p === 'discord') return 'Discord';
  if (
    p.includes('mail') ||
    p.includes('email') ||
    p.includes('gmail') ||
    p.includes('email') ||
    p.includes('mail.com')
  )
    return 'Email';
  if (p.includes('pinterest') || p === 'pinterest') return 'Pinterest';
  if (p.includes('quora') || p === 'quora') return 'Quora';
  if (p.includes('reddit') || p === 'reddit') return 'Reddit';
  if (
    p.includes('textplus') ||
    p.includes('text plus') ||
    p.includes('text+') ||
    p === 'textplus'
  )
    return 'TextPlus';
  if (p.includes('twitch') || p === 'twitch') return 'Twitch';
  if (p.includes('vpn') || p === 'vpn') return 'VPN';
  return platform;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const getStockColor = (logs: number) => {
  if (logs === 0) return 'red';
  if (logs <= 2) return 'yellow';
  return 'green';
};

// Platform order for "All" section
const platformOrder = [
  'instagram',
  'facebook',
  'tiktok',
  'x',
  'linkedin',
  'google',
  'snapchat',
  'vpn',
  'other',
];

// Main platforms that should NOT appear in "Other" section
const mainPlatforms = [
  'instagram',
  'facebook',
  'tiktok',
  'x',
  'twitter',
  'linkedin',
  'google',
  'snapchat',
  'vpn',
];

// Function to determine platform key for grouping
const getPlatformKeyForGrouping = (platform: string): string => {
  const p = platform.toLowerCase();
  if (p.includes('instagram') || p.includes('ig') || p === 'instagram')
    return 'instagram';
  if (p.includes('facebook') || p.includes('fb') || p === 'facebook')
    return 'facebook';
  if (p.includes('tiktok') || p.includes('tik tok') || p === 'tiktok')
    return 'tiktok';
  if (p.includes('x') || p.includes('twitter') || p === 'twitter' || p === 'x')
    return 'x';
  if (p.includes('linkedin') || p === 'linkedin') return 'linkedin';
  if (p.includes('google') || p.includes('voice') || p === 'google voice')
    return 'google';
  if (p.includes('snapchat') || p.includes('snap') || p === 'snapchat')
    return 'snapchat';
  if (p.includes('youtube') || p.includes('video') || p === 'youtube')
    return 'youtube';
  if (p.includes('telegram') || p.includes('tele') || p === 'telegram')
    return 'telegram';
  if (p.includes('discord') || p === 'discord') return 'discord';
  if (
    p.includes('mail') ||
    p.includes('email') ||
    p.includes('gmail') ||
    p.includes('email') ||
    p.includes('mail.com')
  )
    return 'mail';
  if (p.includes('pinterest') || p === 'pinterest') return 'pinterest';
  if (p.includes('quora') || p === 'quora') return 'quora';
  if (p.includes('reddit') || p === 'reddit') return 'reddit';
  if (
    p.includes('textplus') ||
    p.includes('text plus') ||
    p.includes('text+') ||
    p === 'textplus'
  )
    return 'textplus';
  if (p.includes('twitch') || p === 'twitch') return 'twitch';
  if (p.includes('vpn') || p === 'vpn') return 'vpn';
  return 'other';
};

export function AccountsList({
  selectedPlatform,
  selectedCategory,
}: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseMode, setIsPurchaseMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedCredentials, setPurchasedCredentials] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch Accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        // Handle different response structures
        if (data.success && data.accounts) {
          setAccounts(data.accounts);
        } else if (Array.isArray(data)) {
          // If the API directly returns an array
          setAccounts(data);
        } else if (data.accounts) {
          // If accounts is nested differently
          setAccounts(data.accounts);
        } else {
          console.error('Unexpected API response structure:', data);
          setAccounts([]);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  // Fetch User Balance
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUserBalance(data.user.walletBalance || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, [purchaseSuccess]);

  // Debug log to see what accounts are fetched
  useEffect(() => {
    console.log('Fetched accounts:', accounts);
    console.log('Selected platform:', selectedPlatform);
    console.log('Selected category:', selectedCategory);
  }, [accounts, selectedPlatform, selectedCategory]);

  const filteredAccounts = accounts.filter((acc) => {
    // Ensure platform is defined
    if (!acc.platform) return false;

    const normalizedPlatform = acc.platform.toLowerCase().trim();
    const platformKey = getPlatformKeyForGrouping(acc.platform);

    // Platform matching logic
    let platformMatch = false;

    if (selectedPlatform === 'all') {
      platformMatch = true;
    } else if (selectedPlatform === 'other') {
      // Show accounts that don't belong to any main platform
      const isMainPlatform = mainPlatforms.some((mainPlatform) =>
        normalizedPlatform.includes(mainPlatform.toLowerCase()),
      );
      platformMatch = !isMainPlatform;
    } else {
      // Check for specific platform match
      platformMatch =
        platformKey === selectedPlatform ||
        normalizedPlatform.includes(selectedPlatform.toLowerCase());
    }

    // Category matching logic
    let categoryMatch = true;
    if (selectedCategory && selectedCategory !== 'all') {
      const accountSubcategory = (acc.subcategory || 'Uncategorized')
        .toLowerCase()
        .trim();
      const selectedCategoryLower = selectedCategory.toLowerCase().trim();
      categoryMatch = accountSubcategory === selectedCategoryLower;
    }

    return platformMatch && categoryMatch;
  });

  // Debug filtered accounts
  useEffect(() => {
    console.log('Filtered accounts:', filteredAccounts);
    console.log('Filtered accounts count:', filteredAccounts.length);
    if (selectedPlatform === 'other') {
      console.log(
        'Accounts in "Other" category:',
        filteredAccounts.map((acc) => ({
          platform: acc.platform,
          platformKey: getPlatformKeyForGrouping(acc.platform),
          subcategory: acc.subcategory,
        })),
      );
    }
  }, [filteredAccounts, selectedPlatform]);

  // Function to sort accounts by createdAt (oldest first, newest last)
  const sortAccountsByDate = (accountsArray: Account[]): Account[] => {
    const toSortablePosition = (pos: unknown) => {
      const n = typeof pos === 'number' ? pos : Number.NaN;
      return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
    };

    return [...accountsArray].sort((a, b) => {
      const positionA = toSortablePosition(a.position);
      const positionB = toSortablePosition(b.position);

      if (positionA !== positionB) {
        return positionA - positionB;
      }

      // If either account doesn't have createdAt, keep original order
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;

      // Convert to timestamps for comparison
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      // Oldest first (ascending order)
      return dateA - dateB;
    });
  };

  // Group accounts by platform and subcategory for ALL platforms view
  const getGroupedPlatformsForAll = (): PlatformGroup[] => {
    if (selectedPlatform !== 'all') return [];

    const platformMap: { [key: string]: PlatformGroup } = {};

    filteredAccounts.forEach((account) => {
      const platformKey = getPlatformKeyForGrouping(account.platform);
      let platformName = getPlatformDisplayName(account.platform);

      // Use the display name as key for grouping
      if (!platformMap[platformName]) {
        platformMap[platformName] = {
          platformName,
          platformKey: platformName.toLowerCase().replace(/\s+/g, '-'),
          subcategories: {},
        };
      }

      const subcategory = account.subcategory || 'Uncategorized';

      if (!platformMap[platformName].subcategories[subcategory]) {
        platformMap[platformName].subcategories[subcategory] = [];
      }

      platformMap[platformName].subcategories[subcategory].push(account);
    });

    // Convert to array and sort according to platformOrder
    const platformsArray = Object.values(platformMap);

    // Sort platforms according to the specified order
    const sortedPlatforms = platformsArray.sort((a, b) => {
      const aKey = a.platformName.toLowerCase();
      const bKey = b.platformName.toLowerCase();

      const aIndex = platformOrder.findIndex((p) =>
        aKey.includes(p.toLowerCase()),
      );
      const bIndex = platformOrder.findIndex((p) =>
        bKey.includes(p.toLowerCase()),
      );

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.platformName.localeCompare(b.platformName);
    });

    // Sort subcategories within each platform alphabetically
    // Sort accounts within each subcategory by createdAt (oldest first)
    sortedPlatforms.forEach((platform) => {
      const subcategories = Object.entries(platform.subcategories);
      subcategories.sort(([a], [b]) => a.localeCompare(b));

      const sortedSubcategories: { [subcategory: string]: Account[] } = {};
      subcategories.forEach(([subcategory, accounts]) => {
        // Sort accounts by createdAt (oldest first, newest last)
        sortedSubcategories[subcategory] = sortAccountsByDate(accounts);
      });

      platform.subcategories = sortedSubcategories;
    });

    return sortedPlatforms;
  };

  // Group accounts by platform and subcategory for OTHER platforms view
  const getGroupedPlatformsForOther = (): PlatformGroup[] => {
    if (selectedPlatform !== 'other') return [];

    const platformMap: { [key: string]: PlatformGroup } = {};

    filteredAccounts.forEach((account) => {
      const platformName = getPlatformDisplayName(account.platform);

      if (!platformMap[platformName]) {
        platformMap[platformName] = {
          platformName,
          platformKey: platformName.toLowerCase().replace(/\s+/g, '-'),
          subcategories: {},
        };
      }

      const subcategory = account.subcategory || 'Uncategorized';

      if (!platformMap[platformName].subcategories[subcategory]) {
        platformMap[platformName].subcategories[subcategory] = [];
      }

      platformMap[platformName].subcategories[subcategory].push(account);
    });

    const platformsArray = Object.values(platformMap);

    // Custom sort order for "Other" platforms: Discord first, then alphabetical
    const sortedPlatforms = platformsArray.sort((a, b) => {
      const aName = a.platformName.toLowerCase();
      const bName = b.platformName.toLowerCase();

      // Discord always comes first
      if (aName.includes('discord')) return -1;
      if (bName.includes('discord')) return 1;

      // Then YouTube
      if (aName.includes('youtube')) return -1;
      if (bName.includes('youtube')) return 1;

      // Then Telegram
      if (aName.includes('telegram')) return -1;
      if (bName.includes('telegram')) return 1;

      // Then TextPlus
      if (aName.includes('textplus')) return -1;
      if (bName.includes('textplus')) return 1;

      // Then sort alphabetically for other platforms
      return a.platformName.localeCompare(b.platformName);
    });

    // Sort subcategories within each platform alphabetically
    // Sort accounts within each subcategory by createdAt (oldest first)
    sortedPlatforms.forEach((platform) => {
      const subcategories = Object.entries(platform.subcategories);
      subcategories.sort(([a], [b]) => a.localeCompare(b));

      const sortedSubcategories: { [subcategory: string]: Account[] } = {};
      subcategories.forEach(([subcategory, accounts]) => {
        // Sort accounts by createdAt (oldest first, newest last)
        sortedSubcategories[subcategory] = sortAccountsByDate(accounts);
      });

      platform.subcategories = sortedSubcategories;
    });

    return sortedPlatforms;
  };

  // Group accounts by subcategory for INDIVIDUAL platform view
  const getGroupedSubcategoriesForPlatform = (): {
    [subcategory: string]: Account[];
  } => {
    if (selectedPlatform === 'all' || selectedPlatform === 'other') return {};

    const subcategories: { [subcategory: string]: Account[] } = {};

    filteredAccounts.forEach((account) => {
      const subcategory = account.subcategory || 'Uncategorized';

      if (!subcategories[subcategory]) {
        subcategories[subcategory] = [];
      }

      subcategories[subcategory].push(account);
    });

    // Sort subcategories alphabetically
    const sortedEntries = Object.entries(subcategories).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const sortedSubcategories: { [subcategory: string]: Account[] } = {};
    sortedEntries.forEach(([subcategory, accounts]) => {
      // Sort accounts by createdAt (oldest first, newest last)
      sortedSubcategories[subcategory] = sortAccountsByDate(accounts);
    });

    return sortedSubcategories;
  };

  // Helper function to sort filtered accounts by createdAt (oldest first)
  const getSortedFilteredAccounts = (): Account[] => {
    return sortAccountsByDate(filteredAccounts);
  };

  const groupedPlatformsForAll = getGroupedPlatformsForAll();
  const groupedPlatformsForOther = getGroupedPlatformsForOther();
  const groupedSubcategoriesForPlatform = getGroupedSubcategoriesForPlatform();
  const sortedFilteredAccounts = getSortedFilteredAccounts();

  const handleBuyClick = (account: Account) => {
    // ✅ Track ViewContent event when user clicks the Buy button
    if (typeof window !== 'undefined' && window.ttq) {
      try {
        window.ttq.track('ViewContent', {
          contents: [
            {
              content_id: account.id,
              content_type: 'product',
              content_name: `${account.platform} Account - ${account.followers}+ followers`,
            },
          ],
          value: account.price,
          currency: 'NGN',
        });
        console.log('✅ TikTok ViewContent event tracked');
      } catch (trackError) {
        console.error('TikTok tracking error:', trackError);
      }
    }
    
    setSelectedAccount(account);
    setIsModalOpen(true);
    setIsPurchaseMode(false);
    setQuantity(1);
    setPurchaseSuccess(false);
    setPurchasedCredentials([]);
  };

  const handleProceedToPurchase = () => {
    if (!selectedAccount) return;

    if (userBalance < selectedAccount.price) {
      alert(
        `Insufficient balance! You need at least ₦${selectedAccount.price.toLocaleString()} to purchase 1 log.\n\nYour current balance: ₦${userBalance.toLocaleString()}\n\nPlease add funds to your wallet.`,
      );
      return;
    }

    // ✅ Track InitiateCheckout event when user clicks "Proceed to Purchase"
    if (typeof window !== 'undefined' && window.ttq) {
      try {
        const totalAmount = selectedAccount.price;
        window.ttq.track('InitiateCheckout', {
          contents: [
            {
              content_id: selectedAccount.id,
              content_type: 'product',
              content_name: `${selectedAccount.platform} Account - ${selectedAccount.followers}+ followers`,
            },
          ],
          value: totalAmount,
          currency: 'NGN',
        });
        console.log('✅ TikTok InitiateCheckout event tracked');
      } catch (trackError) {
        console.error('TikTok tracking error:', trackError);
      }
    }

    setIsPurchaseMode(true);
    setQuantity(1);
  };

  const handleQuantityChange = (increment: boolean) => {
    if (!selectedAccount) return;

    if (increment) {
      const newQuantity = quantity + 1;
      const newTotal = selectedAccount.price * newQuantity;

      if (newTotal > userBalance) {
        alert(
          `Insufficient balance!\n\nCost for ${newQuantity} logs: ₦${newTotal.toLocaleString()}\nYour balance: ₦${userBalance.toLocaleString()}\n\nMaximum you can buy: ${Math.floor(
            userBalance / (selectedAccount.price || 1),
          )} logs`,
        );
        return;
      }

      if (newQuantity <= selectedAccount.logs) {
        setQuantity(newQuantity);
      } else {
        alert(`Maximum quantity available is ${selectedAccount.logs} logs`);
      }
    } else {
      if (quantity > 1) setQuantity((p) => p - 1);
    }
  };

  const handleCompletePurchase = async () => {
    if (!selectedAccount) return;

    const totalAmount = selectedAccount.price * quantity;

    if (totalAmount > userBalance) {
      alert(
        `Insufficient balance!\n\nTotal cost: ₦${totalAmount.toLocaleString()}\nYour balance: ₦${userBalance.toLocaleString()}\n\nPlease add funds to your wallet.`,
      );
      return;
    }

    setPurchasing(true);

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          quantity: quantity,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPurchasedCredentials(data.purchase.credentials || []);
        setPurchaseSuccess(true);
        setUserBalance(data.newBalance);

        // ✅ Track Purchase event on successful purchase
        if (typeof window !== 'undefined' && window.ttq) {
          try {
            window.ttq.track('Purchase', {
              contents: [
                {
                  content_id: selectedAccount.id,
                  content_type: 'product',
                  content_name: `${selectedAccount.platform} Account - ${selectedAccount.followers}+ followers`,
                },
              ],
              value: totalAmount,
              currency: 'NGN',
            });
            console.log('✅ TikTok Purchase event tracked');
          } catch (trackError) {
            console.error('TikTok tracking error:', trackError);
          }
        }

        // Update local stock
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === selectedAccount.id
              ? { ...acc, logs: Math.max(0, acc.logs - quantity) }
              : acc,
          ),
        );
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Purchase processing failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const totalPrice = selectedAccount ? selectedAccount.price * quantity : 0;
  const canAfford = totalPrice <= userBalance;

  // Get account status based on logs
  const getAccountStatus = (account: Account) => {
    return account.logs === 0 ? 'Sold' : account.status;
  };

  if (loading || userLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading accounts...</div>
    );
  }

  if (filteredAccounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No accounts available for this selection
        {accounts.length > 0 && (
          <div className="text-sm text-gray-400 mt-2">
            Total accounts in database: {accounts.length}
          </div>
        )}
      </div>
    );
  }

  // Helper function to render accounts grouped by platform and subcategory
  const renderAccountsByPlatformGroup = (platformGroups: PlatformGroup[]) => {
    return (
      <div className="space-y-8">
        {platformGroups.map((platform) => (
          <div key={platform.platformKey} className="space-y-6">
            {/* Subcategories and Accounts */}
            {Object.entries(platform.subcategories).map(
              ([subcategory, accounts]) => (
                <div key={subcategory} className="space-y-1.5">
                  {/* Subcategory Header - Fixed size to match "All" view */}
                  {subcategory !== 'Uncategorized' && (
                    <div className="flex items-center gap-2">
                      <h4 className="text-base md:text-lg font-bold text-gray-800">
                        {subcategory}
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {accounts.length} item(s)
                      </span>
                    </div>
                  )}

                  {/* Accounts List - Already sorted by date (oldest first) */}
                  <div className="space-y-2">
                    {accounts.map((account) => {
                      const Icon = getPlatformIcon(account.platform);
                      const gradient = getPlatformGradient(account.platform);
                      const stockColor = getStockColor(account.logs || 0);

                      return (
                        <div
                          key={account.id}
                          className="bg-white rounded-lg p-3 md:p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={cn(
                                'w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                                gradient,
                              )}
                            >
                              <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium md:font-medium text-gray-900 text-xs md:text-sm">
                                {account.vpnType
                                  ? `${account.vpnType}`
                                  : `${account.platform} | ${account.followers.toLocaleString()}+ followers | ${
                                      account.mailIncluded
                                        ? 'Mail Included'
                                        : 'Mail Not Included'
                                    }`}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                            <div
                              className={cn(
                                'px-2 py-1 md:px-3 md:py-1 rounded-md text-xs font-medium md:font-semibold',
                                stockColor === 'yellow' &&
                                  'bg-yellow-100 text-yellow-800',
                                stockColor === 'green' &&
                                  'bg-green-100 text-green-800',
                                stockColor === 'red' &&
                                  'bg-red-100 text-red-800',
                              )}
                            >
                              {account.logs || 0}pcs
                            </div>
                            <div className="text-sm md:text-base font-medium md:font-semibold text-gray-900 min-w-[80px] md:min-w-[100px] text-right">
                              ₦{account.price.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => handleBuyClick(account)}
                              className="min-w-[60px] md:min-w-[70px] rounded-full font-semibold md:font-semibold text-xs md:text-sm h-8 md:h-9 bg-primary hover:bg-primary/90 text-white"
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render accounts grouped by subcategory
  const renderAccountsBySubcategory = (accountsBySubcategory: {
    [subcategory: string]: Account[];
  }) => {
    return (
      <div className="space-y-8">
        {Object.entries(accountsBySubcategory).map(
          ([subcategory, accounts]) => (
            <div key={subcategory} className="space-y-2">
              {/* Subcategory Header - Fixed size to match "All" view */}
              {subcategory !== 'Uncategorized' && (
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    {subcategory}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {accounts.length} item(s)
                  </span>
                </div>
              )}

              {/* Accounts List - Already sorted by date (oldest first) */}
              <div className="space-y-2">
                {accounts.map((account) => {
                  const Icon = getPlatformIcon(account.platform);
                  const gradient = getPlatformGradient(account.platform);
                  const stockColor = getStockColor(account.logs || 0);

                  return (
                    <div
                      key={account.id}
                      className="bg-white rounded-lg p-3 md:p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={cn(
                            'w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                            gradient,
                          )}
                        >
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium md:font-medium text-gray-900 text-xs md:text-sm">
                            {account.vpnType
                              ? `${account.vpnType}`
                              : `${account.platform} | ${account.followers.toLocaleString()}+ followers | ${
                                  account.mailIncluded
                                    ? 'Mail Included'
                                    : 'Mail Not Included'
                                }`}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                        <div
                          className={cn(
                            'px-2 py-1 md:px-3 md:py-1 rounded-md text-xs font-medium md:font-semibold',
                            stockColor === 'yellow' &&
                              'bg-yellow-100 text-yellow-800',
                            stockColor === 'green' &&
                              'bg-green-100 text-green-800',
                            stockColor === 'red' && 'bg-red-100 text-red-800',
                          )}
                        >
                          {account.logs || 0}pcs
                        </div>
                        <div className="text-sm md:text-base font-medium md:font-semibold text-gray-900 min-w-[80px] md:min-w-[100px] text-right">
                          ₦{account.price.toLocaleString()}
                        </div>
                        <Button
                          onClick={() => handleBuyClick(account)}
                          className="min-w-[60px] md:min-w-[70px] rounded-full font-semibold md:font-semibold text-xs md:text-sm h-8 md:h-9 bg-primary hover:bg-primary/90 text-white"
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    );
  };

  return (
    <>
      <div>
        {/* Display for "All" platform - Grouped by platform and subcategory */}
        {selectedPlatform === 'all' && groupedPlatformsForAll.length > 0
          ? renderAccountsByPlatformGroup(groupedPlatformsForAll)
          : /* Display for "Other" platform - Grouped by platform and subcategory */
            selectedPlatform === 'other' && groupedPlatformsForOther.length > 0
            ? renderAccountsByPlatformGroup(groupedPlatformsForOther)
            : /* Display for specific platform - Grouped by subcategory */
              selectedPlatform !== 'all' &&
                selectedPlatform !== 'other' &&
                Object.keys(groupedSubcategoriesForPlatform).length > 0
              ? renderAccountsBySubcategory(groupedSubcategoriesForPlatform)
              : /* Fallback display for when no grouping is needed */
                filteredAccounts.length > 0 && (
                  <div className="space-y-2">
                    {sortedFilteredAccounts.map((account) => {
                      const Icon = getPlatformIcon(account.platform);
                      const gradient = getPlatformGradient(account.platform);
                      const stockColor = getStockColor(account.logs || 0);

                      return (
                        <div
                          key={account.id}
                          className="bg-white rounded-lg p-3 md:p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={cn(
                                'w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                                gradient,
                              )}
                            >
                              <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium md:font-medium text-gray-900 text-xs md:text-sm">
                                {account.vpnType
                                  ? `${account.vpnType}`
                                  : `${account.platform} | ${account.followers.toLocaleString()}+ followers | ${
                                      account.mailIncluded
                                        ? 'Mail Included'
                                        : 'Mail Not Included'
                                    }`}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                            <div
                              className={cn(
                                'px-2 py-1 md:px-3 md:py-1 rounded-md text-xs font-medium md:font-semibold',
                                stockColor === 'yellow' &&
                                  'bg-yellow-100 text-yellow-800',
                                stockColor === 'green' &&
                                  'bg-green-100 text-green-800',
                                stockColor === 'red' &&
                                  'bg-red-100 text-red-800',
                              )}
                            >
                              {account.logs || 0}pcs
                            </div>
                            <div className="text-sm md:text-base font-medium md:font-semibold text-gray-900 min-w-[80px] md:min-w-[100px] text-right">
                              ₦{account.price.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => handleBuyClick(account)}
                              className="min-w-[60px] md:min-w-[70px] rounded-full font-semibold md:font-semibold text-xs md:text-sm h-8 md:h-9 bg-primary hover:bg-primary/90 text-white"
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
      </div>

      {/* Modal for account details and purchase - SLIGHTLY WIDER ON LAPTOP */}
      {isModalOpen && selectedAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => {
            if (!purchasing) {
              setIsModalOpen(false);
              setIsPurchaseMode(false);
              setPurchaseSuccess(false);
            }
          }}
        >
          <div
            className="
bg-white
rounded-2xl
shadow-2xl
w-[clamp(340px,65vw,650px)]
max-h-[92vh]
overflow-y-auto
transition-all
"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md',
                      getPlatformGradient(selectedAccount.platform),
                    )}
                  >
                    {(() => {
                      const Icon = getPlatformIcon(selectedAccount.platform);
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 leading-tight">
                      {selectedAccount.platform} Account
                    </h2>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {purchaseSuccess
                        ? 'Purchase Complete!'
                        : isPurchaseMode
                          ? 'Select Quantity'
                          : 'Account Details'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!purchasing) {
                      setIsModalOpen(false);
                      setIsPurchaseMode(false);
                      setPurchaseSuccess(false);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  disabled={purchasing}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Balance in Modal */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-white text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">Your Balance:</span>
                  </div>
                  <span className="text-base font-bold">
                    ₦{userBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {purchaseSuccess && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-green-900 mb-1">
                      Purchase Successful!
                    </h3>
                    <p className="text-green-700 text-xs mb-1">
                      You purchased {quantity} log(s) for ₦
                      {totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      New Balance: ₦{userBalance.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-slate-600 flex items-center justify-center">
                        <Package className="w-3 h-3 text-white" />
                      </div>
                      Your Credentials ({purchasedCredentials.length} items)
                    </h3>
                    <div className="bg-white rounded p-2 max-h-32 overflow-y-auto space-y-1 border border-slate-300">
                      {purchasedCredentials.map((cred, index) => {
                        if (typeof cred === 'string') {
                          return (
                            <div
                              key={index}
                              className="font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-200 break-all"
                            >
                              <div className="text-gray-900 whitespace-pre-wrap">
                                {cred}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={index}
                              className="font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-200"
                            >
                              <div className="text-gray-900 whitespace-pre-wrap">
                                {JSON.stringify(cred, null, 2)}
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-9 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              )}

              {isPurchaseMode && !purchaseSuccess && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-bold text-gray-900 text-sm mb-3 text-center">
                      Select Quantity
                    </h3>

                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        onClick={() => handleQuantityChange(false)}
                        disabled={quantity <= 1 || purchasing}
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {quantity}
                        </div>
                        <div className="text-xs text-blue-700 mt-0.5">
                          log(s)
                        </div>
                      </div>
                      <Button
                        onClick={() => handleQuantityChange(true)}
                        disabled={
                          quantity >= selectedAccount.logs ||
                          purchasing ||
                          !canAfford
                        }
                        className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="bg-white rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Price per log:</span>
                        <span className="font-medium text-gray-900">
                          ₦{selectedAccount.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium text-gray-900">
                          {quantity}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium text-green-600">
                          {selectedAccount.logs} logs
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Your Balance:</span>
                        <span className="font-medium text-blue-600">
                          ₦{userBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between text-sm">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span
                          className={cn(
                            'font-bold',
                            canAfford ? 'text-green-600' : 'text-red-600',
                          )}
                        >
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {!canAfford && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-800">
                          <p className="font-medium">Insufficient balance!</p>
                          <p>
                            You need ₦
                            {(totalPrice - userBalance).toLocaleString()} more.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsPurchaseMode(false)}
                      disabled={purchasing}
                      className="flex-1 h-9 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCompletePurchase}
                      disabled={purchasing || quantity < 1 || !canAfford}
                      className="flex-1 h-9 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md disabled:opacity-50"
                    >
                      {purchasing
                        ? 'Processing...'
                        : `Pay ₦${totalPrice.toLocaleString()}`}
                    </Button>
                  </div>
                </div>
              )}

              {/* Initial View - Account Details */}
              {!isPurchaseMode && !purchaseSuccess && (
                <>
                  {/* Account Overview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Followers</span>
                      </div>
                      <p className="text-base font-bold text-blue-900">
                        {selectedAccount.followers.toLocaleString()}+
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-1.5 text-green-700 mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          Price per log
                        </span>
                      </div>
                      <p className="text-base font-bold text-green-900">
                        ₦{selectedAccount.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-1.5 text-purple-700 mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          Available Stock
                        </span>
                      </div>
                      <p className="text-base font-bold text-purple-900">
                        {selectedAccount.logs || 0} pcs
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center gap-1.5 text-orange-700 mb-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          Email Access
                        </span>
                      </div>
                      <p className="text-xs font-bold text-orange-900">
                        {selectedAccount.mailIncluded
                          ? 'Included ✓'
                          : 'Not Included'}
                      </p>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">
                      Account Information
                    </h3>

                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">
                          Status
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              getAccountStatus(selectedAccount) === 'Available'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800',
                            )}
                          >
                            {getAccountStatus(selectedAccount)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3 h-3 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0 max-w-full">
                        <p className="text-xs font-medium text-gray-700">
                          Description
                        </p>

                        <p
                          className="
      text-sm font-medium text-gray-900 mt-0.5
      whitespace-pre-wrap
      [overflow-wrap:anywhere]
      leading-relaxed
    "
                        >
                          {selectedAccount.description ||
                            'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  {selectedAccount.files &&
                    selectedAccount.files.length > 0 && (
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-cyan-600 flex items-center justify-center">
                            <Package className="w-3 h-3 text-white" />
                          </div>
                          Attached Files ({selectedAccount.files.length})
                        </h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedAccount.files.map((file, index) => (
                            <div
                              key={index}
                              className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-cyan-200 hover:border-cyan-400 break-all"
                            >
                              📎 {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-9 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleProceedToPurchase}
                      disabled={selectedAccount.logs === 0}
                      className="flex-1 h-9 rounded-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md disabled:opacity-50"
                    >
                      Proceed to Purchase
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}