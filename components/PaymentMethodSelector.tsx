'use client';

import { CiBank } from 'react-icons/ci';
import { ArrowRight } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onSelectBank: () => void;
  onSelectCrypto: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  onSelectBank,
  onSelectCrypto,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1">
          Choose Payment Method
        </h2>
        <p className="text-[10px] sm:text-sm text-gray-600">
          Select how you'd like to fund your wallet
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Bank Transfer Option */}
        <button
          onClick={onSelectBank}
          disabled={isLoading}
          className="group relative rounded-lg sm:rounded-2xl p-3 sm:p-6 border-2 border-blue-300 bg-blue-50 hover:border-blue-600 hover:bg-blue-100 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-blue-200 mb-2 sm:mb-3 group-hover:bg-blue-300 transition-colors">
              <CiBank className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-lg">Bank</h3>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-1 sm:mt-2">Virtual Account</p>
          </div>
        </button>

        {/* Crypto Option (Coming Soon) */}
        <div className="relative">
          {/* Coming Soon Badge */}
          <div className="absolute top-3 right-3 z-10 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
            Coming Soon
          </div>

          <button
            onClick={onSelectCrypto}
            className="group relative w-full rounded-lg sm:rounded-2xl p-3 sm:p-6 border-2 border-orange-200 bg-orange-50 opacity-60 blur-[1px] cursor-not-allowed"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-orange-200 mb-2 sm:mb-3 text-2xl">
                ₿
              </div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-lg">
                Crypto
              </h3>
              <p className="text-[10px] sm:text-sm text-gray-600 mt-1 sm:mt-2">
                BTC, ETH, etc.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}