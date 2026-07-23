'use client';

import { useAppSelector } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

export default function VideoUploadBanner() {
  const { isProcessing, progress, status } = useAppSelector((state: any) => state.videoUpload);

  if (!isProcessing) return null;

  return (
    <div className="w-full bg-[#111111] border-b border-white/5 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'processing' && <Loader2 className="w-4 h-4 text-brand-medium animate-spin" />}
          <span className="text-sm font-medium text-white">
            {status === 'processing' ? 'Processing Video...' : 
             status === 'completed' ? 'Video processing complete!' : 
             status === 'failed' ? 'Video processing failed' : 'Preparing...'}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{Math.max(0, progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${status === 'failed' ? 'bg-red-500' : 'bg-brand-medium'}`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}
