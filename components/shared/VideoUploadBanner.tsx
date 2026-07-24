'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

export default function VideoUploadBanner() {
  const [mounted, setMounted] = useState(false);
  const { isProcessing, progress, status } = useAppSelector((state: any) => state.videoUpload);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isProcessing) return null;

  return (
    <div className="w-full bg-white/[0.03] px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'processing' && <Loader2 className="w-4 h-4 text-[#00D084] animate-spin" />}
          <span className="text-sm font-medium text-white/90">
            {status === 'processing' ? 'Processing Video...' : 
             status === 'completed' ? 'Video processing complete!' : 
             status === 'failed' ? 'Video processing failed' : 'Preparing...'}
          </span>
        </div>
        <span className="text-xs font-mono text-white/50">{Math.max(0, progress)}%</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
        <div 
          className={`h-1 rounded-full transition-all duration-500 ease-out ${status === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-[#00D084] to-[#00B37E]'}`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}
