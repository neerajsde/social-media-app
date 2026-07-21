'use client';

import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginRequiredDialog({ open, onOpenChange }: LoginRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 border-border/80 backdrop-blur-xl">
        <DialogHeader className="text-center items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center">
            <LogIn className="w-7 h-7 text-brand-dark dark:text-brand-medium" />
          </div>
          <DialogTitle className="text-xl font-bold">Login required</DialogTitle>
          <DialogDescription className="text-sm max-w-xs mx-auto text-muted-foreground">
            Create an account or log in to interact with this post.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Link
            href="/login"
            onClick={() => onOpenChange(false)}
            className={cn(buttonVariants({ variant: 'default' }), 'rounded-xl font-semibold bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => onOpenChange(false)}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl font-semibold border-border/60 hover:bg-accent/50')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
