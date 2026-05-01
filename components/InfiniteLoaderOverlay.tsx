'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export function InfiniteLoaderOverlay() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    // Lock scrolling
    document.body.style.overflow = 'hidden';

    // 2 minutes = 120000 ms
    const timer = setTimeout(() => {
      setStatus('error');
    }, 120000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8 bg-background rounded-3xl shadow-2xl border">
        
        <div className="mb-8 flex items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            De'socialPlug
          </span>
        </div>

        {status === 'loading' ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative flex items-center justify-center p-4">
              <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Loading...</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we establish a secure connection. This may take a moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-500 mb-2">
                Connection Error
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                We encountered an unexpected network error. Please try again later.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
