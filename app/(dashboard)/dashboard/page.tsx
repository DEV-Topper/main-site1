'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PlatformSelector } from '@/components/dashboard/platform-selector';
import { CategoryTabs } from '@/components/dashboard/category-tabs';
import { AccountsList } from '@/components/dashboard/accounts-list';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard'; // Import the AuthGuard
import { CommunityAnnouncement } from '@/app/components/community-announcement';

export default function DashboardPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Whenever platform changes, reset to 'all'
    setSelectedCategory('all');
  }, [selectedPlatform]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <main className="p-6 lg:p-8 bg-gray-50">
          {/* Stats section */}
          <StatsCards />

          {/* Platform selector section */}
          <div className="mb-6">
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onPlatformChange={(platformId) => {
                setSelectedPlatform(platformId);
                setSelectedCategory('all'); // reset category when platform changes
              }}
            />
          </div>

          {/* Dynamic subcategory tabs */}
          <div className="mb-6">
            <CategoryTabs
              selectedPlatform={selectedPlatform}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Accounts list filtered by platform + subcategory */}
          <AccountsList
            selectedPlatform={selectedPlatform}
            selectedCategory={selectedCategory}
          />
          <CommunityAnnouncement
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </main>
      </DashboardLayout>
    </AuthGuard>
  );
}
