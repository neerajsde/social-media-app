'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLoginOtpVerifyMutation, useResendLoginOtpMutation } from '@/lib/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { toast } from 'sonner';

export default function LoginVerifyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const otpToken = useAppSelector((state) => state.auth.otpToken);

  const [otp, setOtp] = useState('');
  const [verifyOtp, { isLoading: isVerifying }] = useLoginOtpVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendLoginOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      toast.error('Session expired', { description: 'Please try logging in again.' });
      router.push('/login');
      return;
    }
    if (otp.length < 4) {
      toast.error('Invalid OTP', { description: 'Please enter a valid verification code.' });
      return;
    }

    try {
      const result = await verifyOtp({ otp, token: otpToken }).unwrap();
      if (result.accessToken && result.refreshToken) {
        dispatch(setCredentials({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user || undefined
        }));
        toast.success('Successfully authenticated!');
        router.push('/');
      }
    } catch (err: any) {
      toast.error('Verification failed', { description: err?.data?.message || 'Invalid or expired OTP.' });
    }
  };

  const handleResend = async () => {
    if (!otpToken) return;
    try {
      await resendOtp({ token: otpToken }).unwrap();
      toast.success('OTP sent!', { description: 'A new verification code has been sent to your email.' });
    } catch (err: any) {
      toast.error('Resend failed', { description: err?.data?.message || 'Please try again later.' });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-brand-lightest" />
          </div>
          <span className="text-xl font-bold">NexusPlay</span>
        </Link>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center mb-2">
            <KeyRound className="w-7 h-7 text-brand-dark dark:text-brand-medium" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
          <CardDescription>We sent a 2FA verification code to your registered email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Security Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000 000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={8}
                className="text-center tracking-[0.5em] text-lg font-mono font-bold"
                autoComplete="one-time-code"
              />
            </div>

            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isVerifying}>
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={handleResend} disabled={isResending} className="text-xs text-brand-dark dark:text-brand-medium hover:underline">
              {isResending ? 'Sending...' : "Didn't receive verification email? Resend code"}
            </Button>
          </div>
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
