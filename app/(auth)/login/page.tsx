'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useLoginMutation } from '@/lib/features/auth/authApi';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials, setOtpRequired } from '@/lib/features/auth/authSlice';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.usernameOrEmail.trim()) e.usernameOrEmail = 'Email or username is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await login(form).unwrap();
      if (result.token && !result.accessToken) {
        // 2FA required
        dispatch(setOtpRequired(result.token));
        toast.info('OTP sent to your email', { description: 'Please check your inbox for the verification code.' });
        router.push('/login/verify');
      } else if (result.accessToken && result.refreshToken) {
        dispatch(setCredentials({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user || undefined }));
        toast.success('Welcome back!');
        router.push('/');
      }
    } catch (err: any) {
      const message = err?.data?.message || 'Login failed. Please check your credentials.';
      toast.error('Login failed', { description: message });
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
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Email or Username</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="you@example.com"
                value={form.usernameOrEmail}
                onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                className={errors.usernameOrEmail ? 'border-destructive' : ''}
                autoComplete="username"
              />
              {errors.usernameOrEmail && <p className="text-xs text-destructive">{errors.usernameOrEmail}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-brand-dark dark:text-brand-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
            </div>

            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-dark dark:text-brand-medium font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to feed
        </Link>
      </div>
    </div>
  );
}
