'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
}

export default function Logo({ className, imageClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image 
        src="/images/logo.png" 
        alt="ReelTube Logo" 
        width={150} 
        height={40} 
        priority
        className={cn("object-contain h-10 w-auto", imageClassName)}
      />
    </div>
  );
}
