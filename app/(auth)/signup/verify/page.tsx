'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegisterStep2Mutation, useResendRegisterOtpMutation } from '@/lib/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { toast } from 'sonner';

export default function SignupVerifyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const otpToken = useAppSelector((state) => state.auth.otpToken);

  const [otp, setOtp] = useState('');
  const [verifyOtp, { isLoading: isVerifying }] = useRegisterStep2Mutation();
  const [resendOtp, { isLoading: isResending }] = useResendRegisterOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      toast.error('Session expired', { description: 'Please register again.' });
      router.push('/signup');
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
          user: (result as any).user || undefined
        }));
        toast.success('Registration successful! Welcome to ReelTube.');
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
        <Link href="/" className="inline-flex justify-center mb-6">
          <Logo imageClassName="h-12" />
        </Link>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center mb-2">
            <KeyRound className="w-7 h-7 text-brand-dark dark:text-brand-medium" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>Enter the activation code sent to your email to complete registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Activation Code</Label>
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
              {isVerifying ? 'Activating...' : 'Activate Account'}
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
        <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to registration
        </Link>
      </div>
    </div>
  );
}
