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
    <div className="w-full space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Choose Payment Method
        </h2>
        <p className="text-sm text-gray-600">
          Select how you'd like to fund your wallet
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bank Transfer Option */}
        <button
          onClick={onSelectBank}
          disabled={isLoading}
          className="group relative rounded-xl sm:rounded-2xl p-6 border-2 border-blue-300 bg-blue-50 hover:border-blue-600 hover:bg-blue-100 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-200 mb-3 group-hover:bg-blue-300 transition-colors">
              <CiBank className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Bank Transfer</h3>
            <p className="text-sm text-gray-600 mt-2">Virtual Account</p>
            <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
              Select <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Crypto Option */}
        <button
          onClick={onSelectCrypto}
          disabled={isLoading}
          className="group relative rounded-xl sm:rounded-2xl p-6 border-2 border-orange-300 bg-orange-50 hover:border-orange-600 hover:bg-orange-100 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-orange-200 mb-3 group-hover:bg-orange-300 transition-colors text-3xl">
              ₿
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Cryptocurrency</h3>
            <p className="text-sm text-gray-600 mt-2">Bitcoin, Ethereum, etc.</p>
            <div className="mt-4 flex items-center gap-2 text-orange-600 font-medium">
              Select <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">ℹ️ Info:</span> You can switch payment methods anytime. We charge 0.9% fee for bank transfers and network fees for crypto.
        </p>
      </div>
    </div>
  );
}
