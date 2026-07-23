'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useResetPasswordRequestMutation } from '@/lib/features/auth/authApi';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetRequest, { isLoading }] = useResetPasswordRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email or username'); return; }

    try {
      await resetRequest({ emailOrUsername: email }).unwrap();
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      toast.error('Failed to send reset link', { description: err?.data?.message || 'Please try again.' });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex justify-center mb-6">
          <Logo imageClassName="h-12" />
        </Link>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center mb-2">
            {sent ? <CheckCircle className="w-7 h-7 text-brand-medium" /> : <Mail className="w-7 h-7 text-brand-dark dark:text-brand-medium" />}
          </div>
          <CardTitle className="text-2xl font-bold">{sent ? 'Check your email' : 'Forgot password?'}</CardTitle>
          <CardDescription>
            {sent ? `We've sent an OTP to ${email}. Enter it on the next step to reset your password.` : "Enter your email or username and we'll send you a reset code."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <Button className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" nativeButton={false} render={<Link href="/reset-password" />}>
                Enter OTP
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => setSent(false)}>
                Didn&apos;t receive it? Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isLoading}>
                {isLoading ? <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
