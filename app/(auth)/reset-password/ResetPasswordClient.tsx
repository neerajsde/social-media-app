'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useResetPasswordVerifyMutation, useResetPasswordMutation } from '@/lib/features/auth/authApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [verifyOtp, { isLoading: isVerifying }] = useResetPasswordVerifyMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setErrors({ otp: 'Please enter a valid OTP' });
      return;
    }

    try {
      const result = await verifyOtp({ token: initialToken, otp }).unwrap();
      setVerifiedToken(result.token);
      setStep(2);
      setErrors({});
      toast.success('OTP verified! Please set a new password.');
    } catch (err: any) {
      toast.error('Verification failed', { description: err?.data?.message || 'Invalid or expired OTP.' });
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const eObj: Record<string, string> = {};
    if (form.password.length < 8) eObj.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) eObj.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(eObj).length > 0) {
      setErrors(eObj);
      return;
    }

    try {
      await resetPassword({ token: verifiedToken, password: form.password, confirmPassword: form.confirmPassword }).unwrap();
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error('Reset failed', { description: err?.data?.message || 'Something went wrong.' });
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-medium/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-brand-medium" />
            </div>
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>Your password has been successfully reset. You can now log in with your new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" nativeButton={false} render={<Link href="/login" />}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialToken) {
    return (
      <div className="w-full max-w-md text-center">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Invalid Session</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" nativeButton={false} render={<Link href="/forgot-password" />}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {step === 1 ? <KeyRound className="w-7 h-7 text-brand-dark dark:text-brand-medium" /> : <Lock className="w-7 h-7 text-brand-dark dark:text-brand-medium" />}
          </div>
          <CardTitle className="text-2xl font-bold">{step === 1 ? 'Enter OTP' : 'Create new password'}</CardTitle>
          <CardDescription>
            {step === 1 ? 'We sent a verification code to your email' : 'Your new password must be different from previous used passwords'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input id="otp" placeholder="Enter OTP from email" value={otp} onChange={(e) => setOtp(e.target.value)} className={errors.otp ? 'border-destructive' : ''} />
                {errors.otp && <p className="text-xs text-destructive">{errors.otp}</p>}
              </div>

              <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isVerifying}>
                {isVerifying ? <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" /> : null}
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={cn(errors.password ? 'border-destructive' : '', 'pr-10')} autoComplete="new-password" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={errors.confirmPassword ? 'border-destructive' : ''} autoComplete="new-password" />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isResetting}>
                {isResetting ? <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isResetting ? 'Resetting...' : 'Reset Password'}
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