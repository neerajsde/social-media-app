'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { logout as logoutAction } from '@/lib/features/auth/authSlice';
import {
  Settings,
  User,
  Shield,
  Lock,
  Globe,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { useGetProfileQuery, useUpdateProfileMutation, useUpdateSocialLinksMutation, useChangePasswordMutation } from '@/lib/features/user/userApi';
import {
  useLogoutMutation,
  useLogoutAllDevicesMutation,
  useGetSessionsQuery,
  useDeleteAccountMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
} from '@/lib/features/auth/authApi';

// ─── Helpers ────────────────────────────────────────────
function getDeviceIcon(userAgent: string) {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return Smartphone;
  if (ua.includes('tablet') || ua.includes('ipad')) return Tablet;
  return Monitor;
}

function formatSessionDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return 'Unknown'; }
}

// ─── Main Page ──────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // ─── API hooks ──────────────────────────────────────
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const user = profileData?.user;

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateSocialLinks] = useUpdateSocialLinksMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logoutMutation] = useLogoutMutation();
  const [logoutAllDevices] = useLogoutAllDevicesMutation();
  const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useGetSessionsQuery();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const [enable2FA, { isLoading: isEnabling2FA }] = useEnable2FAMutation();
  const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAMutation();
  const [disable2FA, { isLoading: isDisabling2FA }] = useDisable2FAMutation();

  // ─── Tab state ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile');

  // ─── Profile form ────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  const [birthdate, setBirthdate] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // ─── Password form ───────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeToken, setPasswordChangeToken] = useState<string | null>(null);
  const [passwordOtp, setPasswordOtp] = useState('');

  // ─── 2FA state ───────────────────────────────────────
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState<string | null>(null);
  const [twoFAOtp, setTwoFAOtp] = useState('');
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

  // ─── Delete account ──────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ─── Sync profile state from API ─────────────────────
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setUsername(user.username ?? '');
      setBio(user.bio ?? '');
      setGender((user.profile as any)?.gender ?? '');
      setBirthdate((user.profile as any)?.birthdate ? new Date((user.profile as any).birthdate).toISOString().split('T')[0] : '');
      setLocation((user.profile as any)?.location ?? '');
      setWebsiteUrl((user.profile as any)?.websiteUrl ?? '');
    }
  }, [user]);

  // ─── Handlers ──────────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters.');
      return;
    }
    if (lastName.trim() && lastName.trim().length < 2) {
      toast.error('Last name must be at least 2 characters.');
      return;
    }
    if (bio.length > 160) {
      toast.error('Bio must be at most 160 characters.');
      return;
    }

    let formattedWebsite = websiteUrl.trim();
    if (formattedWebsite && !formattedWebsite.startsWith('http')) {
      formattedWebsite = `https://${formattedWebsite}`;
    }
    if (formattedWebsite) {
      try { new URL(formattedWebsite); } catch { toast.error('Invalid website URL.'); return; }
    }

    const tid = toast.loading('Saving profile...');
    try {
      await updateProfile({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        bio: bio.trim() || null,
        gender: gender || null,
        birthdate: birthdate ? new Date(birthdate).toISOString() : null,
        location: location.trim() || null,
      }).unwrap();

      if (formattedWebsite !== (user?.profile?.websiteUrl ?? '')) {
        await updateSocialLinks({ websiteUrl: formattedWebsite || null }).unwrap();
      }

      toast.success('Profile updated successfully!', { id: tid });
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to update profile';
      toast.error(msg, { id: tid });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])/.test(newPassword)) {
      toast.error('Password needs uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different from current.');
      return;
    }

    const tid = toast.loading('Changing password...');
    try {
      const res = await changePassword({
        oldPassword: currentPassword,
        newPassword,
        confPassword: confirmPassword,
      }).unwrap();

      if (res.token) {
        // 2FA enabled → OTP required
        setPasswordChangeToken(res.token);
        toast.info('OTP sent to your email. Please verify.', { id: tid });
      } else {
        toast.success(res.message || 'Password changed successfully!', { id: tid });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to change password.', { id: tid });
    }
  };

  const handleEnable2FA = async () => {
    const tid = toast.loading('Enabling 2FA...');
    try {
      const res = await enable2FA().unwrap();
      setTwoFAToken(res.token);
      toast.success('OTP sent to your email. Verify to enable 2FA.', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to enable 2FA.', { id: tid });
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFAOtp || twoFAOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    const tid = toast.loading('Verifying OTP...');
    try {
      await verify2FA({ otp: twoFAOtp, token: twoFAToken! }).unwrap();
      toast.success('2FA enabled successfully!', { id: tid });
      setTwoFAEnabled(true);
      setTwoFAToken(null);
      setTwoFAOtp('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid OTP. Try again.', { id: tid });
    }
  };

  const handleDisable2FA = async () => {
    if (!disable2FAPassword) {
      toast.error('Password is required to disable 2FA.');
      return;
    }
    const tid = toast.loading('Disabling 2FA...');
    try {
      await disable2FA({ password: disable2FAPassword }).unwrap();
      toast.success('2FA disabled successfully.', { id: tid });
      setTwoFAEnabled(false);
      setShowDisable2FADialog(false);
      setDisable2FAPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to disable 2FA.', { id: tid });
    }
  };

  const handleLogoutAllDevices = async () => {
    const tid = toast.loading('Logging out from all devices...');
    try {
      await logoutAllDevices().unwrap();
      toast.success('Logged out from all devices.', { id: tid });
      dispatch(logoutAction());
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to logout.', { id: tid });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    if (!deletePassword) {
      toast.error('Password is required.');
      return;
    }
    const tid = toast.loading('Deleting account...');
    try {
      await deleteAccount({ password: deletePassword, reason: deleteReason }).unwrap();
      toast.success('Account deletion has been processed.', { id: tid });
      dispatch(logoutAction());
      router.push('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete account.', { id: tid });
    }
  };

  // ─── Password requirements checker ───────────────────
  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?#&]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword.length > 0,
  }), [newPassword, confirmPassword]);

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-medium" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  const sessions = sessionsData?.sessions ?? [];

  return (
    <div className="w-full max-w-2xl p-4 md:p-6 space-y-6 pb-20 border-x border-border/40 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-medium/20 to-brand-dark/10">
          <Settings className="w-5 h-5 text-brand-medium" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your account, security, and privacy.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Sidebar nav */}
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible bg-muted/40 dark:bg-zinc-900/60 p-1.5 w-full md:w-[220px] shrink-0 gap-1 rounded-xl border border-border/50 md:sticky md:top-4">
          {[
            { value: 'profile', icon: User, label: 'Profile' },
            { value: 'security', icon: Shield, label: 'Security' },
            { value: 'sessions', icon: Monitor, label: 'Sessions' },
            { value: 'privacy', icon: Globe, label: 'Privacy & Safety' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`shrink-0 flex items-center gap-2 whitespace-nowrap py-2.5 px-3 text-xs md:text-sm font-medium rounded-lg transition-colors text-left w-auto md:w-full ${
                activeTab === value
                  ? 'bg-brand-medium/10 text-brand-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-grow min-w-0 space-y-6">
          {/* ══════════════ PROFILE TAB ══════════════ */}
          {activeTab === 'profile' && <div className="space-y-6">
            {/* User card preview */}
            <Card className="border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-brand-medium/30">
                    <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                    <AvatarFallback className="bg-brand-medium/20 text-brand-medium font-bold text-lg">
                      {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile form */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Account Information</CardTitle>
                <CardDescription className="text-xs">Update your personal information and bio.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-firstName" className="text-xs font-semibold text-muted-foreground">First Name *</Label>
                      <Input id="s-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                        className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-lastName" className="text-xs font-semibold text-muted-foreground">Last Name</Label>
                      <Input id="s-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
                        className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="s-username" className="text-xs font-semibold text-muted-foreground">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                      <Input id="s-username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))} placeholder="username"
                        className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pl-7" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="s-bio" className="text-xs font-semibold text-muted-foreground">
                      Bio <span className="text-muted-foreground/60">({bio.length}/160)</span>
                    </Label>
                    <Textarea id="s-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something about yourself..."
                      rows={3} maxLength={160} className="bg-muted/30 border-border focus:border-brand-medium text-sm resize-none" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-gender" className="text-xs font-semibold text-muted-foreground">Gender</Label>
                      <Select value={gender} onValueChange={(val) => setGender(val ?? '')}>
                        <SelectTrigger className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male" className="text-sm">Male</SelectItem>
                          <SelectItem value="female" className="text-sm">Female</SelectItem>
                          <SelectItem value="other" className="text-sm">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-birthdate" className="text-xs font-semibold text-muted-foreground">Birthdate</Label>
                      <Input id="s-birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
                        className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-location" className="text-xs font-semibold text-muted-foreground">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input id="s-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mumbai, India"
                          className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pl-8" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-website" className="text-xs font-semibold text-muted-foreground">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input id="s-website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com"
                          className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pl-8" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isUpdatingProfile}
                      className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white text-xs px-6 font-semibold flex items-center gap-1.5">
                      {isUpdatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>}

          {/* ══════════════ SECURITY TAB ══════════════ */}
          {activeTab === 'security' && <div className="space-y-6">
            {/* Change Password */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-medium" /> Change Password
                </CardTitle>
                <CardDescription className="text-xs">Choose a strong password to protect your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordChangeToken ? (
                  /* OTP Verification Step (2FA enabled) */
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <KeyRound className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>2FA is enabled. An OTP has been sent to your email. Enter it below to confirm password change.</span>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Enter OTP</Label>
                      <Input value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP"
                        maxLength={6} className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm tracking-widest font-mono text-center" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setPasswordChangeToken(null); setPasswordOtp(''); }}
                        className="rounded-full text-xs">Cancel</Button>
                      <Button size="sm" disabled={passwordOtp.length !== 6}
                        className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white text-xs px-5"
                        onClick={async () => {
                          const tid = toast.loading('Verifying OTP...');
                          try {
                            await changePassword({ oldPassword: currentPassword, newPassword, confPassword: confirmPassword }).unwrap();
                            toast.success('Password changed successfully!', { id: tid });
                            setPasswordChangeToken(null);
                            setPasswordOtp('');
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          } catch (err: any) {
                            toast.error(err?.data?.message || 'Verification failed.', { id: tid });
                          }
                        }}>
                        Verify & Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Current Password</Label>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"
                          className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pr-9" />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">New Password</Label>
                      <div className="relative">
                        <Input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                          className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pr-9" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Confirm New Password</Label>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                          className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm pr-9" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password strength indicators */}
                    {newPassword.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 p-3 rounded-lg bg-muted/20 border border-border/50">
                        {[
                          { label: '8+ characters', ok: passwordChecks.length },
                          { label: 'Uppercase letter', ok: passwordChecks.uppercase },
                          { label: 'Lowercase letter', ok: passwordChecks.lowercase },
                          { label: 'Number', ok: passwordChecks.number },
                          { label: 'Special char (@$!%*?#&)', ok: passwordChecks.special },
                          { label: 'Passwords match', ok: passwordChecks.match },
                        ].map(({ label, ok }) => (
                          <div key={label} className="flex items-center gap-1.5 text-[11px]">
                            {ok ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-zinc-500" />}
                            <span className={ok ? 'text-emerald-400' : 'text-muted-foreground'}>{label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isChangingPassword}
                        className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white text-xs px-5 font-semibold flex items-center gap-1.5">
                        {isChangingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* 2FA Card */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-brand-medium" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription className="text-xs">Add an extra layer of security. An OTP will be required during login.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {twoFAToken ? (
                  /* OTP Verification for 2FA Setup */
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-brand-medium/10 border border-brand-medium/20 flex items-start gap-2 text-xs text-brand-medium">
                      <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>An OTP has been sent to your email. Enter it below to enable 2FA.</span>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Verification Code</Label>
                      <Input value={twoFAOtp} onChange={(e) => setTwoFAOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000" maxLength={6}
                        className="bg-muted/30 border-border focus:border-brand-medium h-9 text-sm tracking-widest font-mono text-center max-w-[200px]" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setTwoFAToken(null); setTwoFAOtp(''); }}
                        className="rounded-full text-xs">Cancel</Button>
                      <Button size="sm" disabled={isVerifying2FA || twoFAOtp.length !== 6} onClick={handleVerify2FA}
                        className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white text-xs px-5 flex items-center gap-1.5">
                        {isVerifying2FA && <Loader2 className="w-3 h-3 animate-spin" />}
                        Verify & Enable
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Enable 2FA Login Verification</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Requires a one-time code sent to your email upon login.</p>
                    </div>
                    {twoFAEnabled ? (
                      <Button variant="outline" size="sm" onClick={() => setShowDisable2FADialog(true)}
                        className="rounded-full text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                        Disable
                      </Button>
                    ) : (
                      <Button size="sm" disabled={isEnabling2FA} onClick={handleEnable2FA}
                        className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white text-xs px-5 flex items-center gap-1.5">
                        {isEnabling2FA && <Loader2 className="w-3 h-3 animate-spin" />}
                        Enable
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disable 2FA Dialog */}
            <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
              <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Disable 2FA
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    This will remove the extra security layer. Enter your password to confirm.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
                    <Input type="password" value={disable2FAPassword} onChange={(e) => setDisable2FAPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-zinc-900 border-zinc-800 focus:border-brand-medium h-9 text-sm" />
                  </div>
                </div>
                <DialogFooter className="mt-4 flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setShowDisable2FADialog(false); setDisable2FAPassword(''); }}
                    className="rounded-full text-xs">Cancel</Button>
                  <Button variant="destructive" size="sm" disabled={isDisabling2FA} onClick={handleDisable2FA}
                    className="rounded-full text-xs px-5 flex items-center gap-1.5">
                    {isDisabling2FA && <Loader2 className="w-3 h-3 animate-spin" />}
                    Disable 2FA
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>}

          {/* ══════════════ SESSIONS TAB ══════════════ */}
          {activeTab === 'sessions' && <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Active Sessions</CardTitle>
                  <CardDescription className="text-xs">Devices currently logged into your account.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogoutAllDevices}
                  className="rounded-full text-xs border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout All
                </Button>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-medium" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No active sessions found.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session: any, idx: number) => {
                      const DeviceIcon = getDeviceIcon(session.userAgent || session.deviceName || '');
                      return (
                        <div key={session.id || idx}
                          className={`flex items-center gap-3.5 p-3 rounded-xl border transition-colors ${session.isCurrent
                              ? 'border-brand-medium/30 bg-brand-medium/5'
                              : 'border-border/50 bg-muted/10 hover:bg-muted/20'
                            }`}>
                          <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-brand-medium/15 text-brand-medium' : 'bg-muted/40 text-muted-foreground'
                            }`}>
                            <DeviceIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-foreground flex items-center gap-2 truncate">
                              {session.deviceName || 'Unknown Device'}
                              {session.isCurrent && (
                                <span className="shrink-0 text-[10px] font-semibold bg-brand-medium/20 text-brand-medium px-1.5 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{session.ipAddress || 'Unknown IP'}</span>
                              <span>•</span>
                              <span>{formatSessionDate(session.createdAt)}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>}

          {/* ══════════════ PRIVACY & SAFETY TAB ══════════════ */}
          {activeTab === 'privacy' && <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Visibility Settings</CardTitle>
                <CardDescription className="text-xs">Control who can view your posts and engage with your content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Private Profile Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Only approved followers will be able to see your posts.</p>
                  </div>
                  <Switch checked={false} onCheckedChange={() => toast.info('Coming soon!')} />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Allow Message Requests</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Let users you don&apos;t follow send you direct messages.</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => toast.info('Coming soon!')} />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Show Activity Status</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Let others see when you&apos;re active on the platform.</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => toast.info('Coming soon!')} />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20 border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs">Irreversible actions with permanent consequences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-xs text-muted-foreground">
                  Once your account is deleted, all of your content, posts, followers, and personal data will be
                  permanently removed. This action cannot be undone.
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}
                  className="w-full sm:w-auto flex items-center gap-2 font-semibold text-xs">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    This will permanently delete your account, all posts, media, likes, comments, and followers.
                    This action cannot be reversed.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Reason for leaving (optional)</Label>
                    <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={2}
                      placeholder="We'd love to know why you're leaving..."
                      className="bg-zinc-900 border-zinc-800 focus:border-destructive/50 text-sm resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Password *</Label>
                    <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-zinc-900 border-zinc-800 focus:border-destructive/50 h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Type <span className="text-destructive font-bold">DELETE</span> to confirm
                    </Label>
                    <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="bg-zinc-900 border-zinc-800 focus:border-destructive/50 h-9 text-sm font-mono tracking-widest" />
                  </div>
                </div>
                <DialogFooter className="mt-4 flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setDeleteDialogOpen(false); setDeletePassword(''); setDeleteConfirmText(''); setDeleteReason(''); }}
                    className="rounded-full text-xs">Cancel</Button>
                  <Button variant="destructive" size="sm"
                    disabled={isDeletingAccount || deleteConfirmText !== 'DELETE' || !deletePassword}
                    onClick={handleDeleteAccount}
                    className="rounded-full text-xs px-5 flex items-center gap-1.5">
                    {isDeletingAccount && <Loader2 className="w-3 h-3 animate-spin" />}
                    Permanently Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>}
        </div>
      </div>
    </div>
  );
}
