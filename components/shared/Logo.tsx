'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  collapsed?: boolean;
}

export default function Logo({ className, imageClassName, collapsed }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image 
        src={collapsed ? "/images/small_logo.png" : "/images/logo.png"} 
        alt="ReelTube Logo" 
        width={collapsed ? 40 : 150} 
        height={40} 
        priority
        className={cn("object-contain h-10 w-auto", imageClassName)}
      />
    </div>
  );
}
