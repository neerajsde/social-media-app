'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, TrendingUp, ArrowLeft, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useRegisterStep1Mutation } from '@/lib/features/auth/authApi';
import { useAppDispatch } from '@/lib/hooks';
import { setOtpRequired } from '@/lib/features/auth/authSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerStep1, { isLoading }] = useRegisterStep1Mutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = passwordChecks.filter((c) => c.test(form.password)).length;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (passwordStrength < 3) e.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!acceptTerms) e.terms = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await registerStep1(form).unwrap();
      if (result.token) {
        dispatch(setOtpRequired(result.token));
        toast.success('OTP sent!', { description: 'Check your email for the verification code.' });
        router.push('/signup/verify');
      }
    } catch (err: any) {
      toast.error('Registration failed', { description: err?.data?.message || 'Please try again.' });
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
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>Join the community and start connecting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your_username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className={errors.username ? 'border-destructive' : ''}
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={cn(errors.password ? 'border-destructive' : '', 'pr-10')}
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {/* Strength indicator */}
              {form.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= passwordStrength ? (passwordStrength <= 2 ? 'bg-destructive' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-brand-medium') : 'bg-muted')} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordChecks.map(({ label, test }) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs">
                        {test(form.password) ? <Check className="w-3 h-3 text-brand-medium" /> : <X className="w-3 h-3 text-muted-foreground" />}
                        <span className={test(form.password) ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={cn(errors.confirmPassword ? 'border-destructive' : '', 'pr-10')}
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(!!c)} className="mt-0.5" />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                I agree to the <Link href="#" className="text-brand-dark dark:text-brand-medium hover:underline">Terms of Service</Link> and <Link href="#" className="text-brand-dark dark:text-brand-medium hover:underline">Privacy Policy</Link>
              </Label>
            </div>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-brand-lightest border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-dark dark:text-brand-medium font-medium hover:underline">
              Sign in
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
