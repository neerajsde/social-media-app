'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useResetPasswordMutation } from '@/lib/features/auth/authApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ password: '', confirmPassword: '', token: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.token.trim()) e.token = 'OTP token is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword(form).unwrap();
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error('Reset failed', { description: err?.data?.message || 'Invalid token or try again.' });
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
            <Lock className="w-7 h-7 text-brand-dark dark:text-brand-medium" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter the OTP and create a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">OTP Code</Label>
              <Input id="token" placeholder="Enter OTP from email" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} className={errors.token ? 'border-destructive' : ''} />
              {errors.token && <p className="text-xs text-destructive">{errors.token}</p>}
            </div>

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

            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isLoading}>
              {isLoading ? <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
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
