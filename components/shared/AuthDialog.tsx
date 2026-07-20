'use client';

import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export default function AuthDialog({ open, onOpenChange, title, description }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center">
            <LogIn className="w-7 h-7 text-brand-dark dark:text-brand-medium" />
          </div>
          <DialogTitle className="text-xl">{title || 'Sign in to continue'}</DialogTitle>
          <DialogDescription className="text-sm max-w-xs mx-auto">
            {description || 'Join NexusPlay to like posts, leave comments, follow creators, and connect with the community.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" nativeButton={false} render={
            <Link href="/login" onClick={() => onOpenChange(false)} />
          }>
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Button>
          <Button variant="outline" nativeButton={false} render={
            <Link href="/signup" onClick={() => onOpenChange(false)} />
          }>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
