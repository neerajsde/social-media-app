'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { logout as logoutAction } from '@/lib/features/auth/authSlice';
import {
  Settings,
  User,
  Shield,
  Monitor,
  Globe,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Smartphone,
  Tablet,
  LogOut,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Camera
} from 'lucide-react';
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
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return 'Unknown'; }
}

// ─── Main Page ──────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ─── API hooks ──────────────────────────────────────
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const user = profileData?.user;

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateSocialLinks] = useUpdateSocialLinksMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logoutAllDevices] = useLogoutAllDevicesMutation();
  const { data: sessionsData, isLoading: sessionsLoading } = useGetSessionsQuery();
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
      setTwoFAEnabled(user.totp?.enabled ?? false);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-brand-medium/20 rounded-full animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin text-brand-medium relative z-10" />
        </div>
        <p className="text-sm font-medium text-white/50 tracking-wide uppercase">Loading settings...</p>
      </div>
    );
  }

  const sessions = sessionsData?.sessions ?? [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-12 min-h-screen pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-medium/10 flex items-center justify-center border border-brand-medium/20 shadow-lg shadow-brand-medium/5 shrink-0">
          <Settings className="w-5 h-5 md:w-6 md:h-6 text-brand-medium" />
        </div>
        <div>
          <h1 className="text-xl md:text-3xl font-bold font-heading tracking-tight text-white/90">Settings</h1>
          <p className="text-xs md:text-sm text-white/40 mt-0.5 md:mt-1">Manage your account preferences, security, and privacy.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-none sticky top-0 md:top-24 h-max z-30 bg-[#111111]/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none pt-4 md:pt-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-b-0 border-white/[0.04]">
          {[
            { id: 'profile', icon: User, label: 'Profile Settings', desc: 'Personal info & bio' },
            { id: 'security', icon: Shield, label: 'Security', desc: 'Password & 2FA' },
            { id: 'sessions', icon: Monitor, label: 'Active Sessions', desc: 'Manage devices' },
            { id: 'privacy', icon: Globe, label: 'Privacy & Safety', desc: 'Visibility & limits' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 text-left min-w-[220px] md:min-w-0 group overflow-hidden shrink-0 ${
                  isActive
                    ? 'bg-white/[0.08] shadow-sm ring-1 ring-white/10 md:ring-0'
                    : 'bg-white/[0.02] md:bg-transparent hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-medium rounded-r-full" />
                )}
                <div className={`p-2 rounded-lg md:rounded-xl transition-colors shrink-0 ${isActive ? 'bg-brand-medium/20 text-brand-medium' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-bold transition-colors truncate ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[11px] md:text-xs transition-colors truncate ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ══════════════ PROFILE TAB ══════════════ */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Preview Card */}
                <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-white/[0.04] p-6 shadow-2xl backdrop-blur-xl group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-medium/10 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20 transition-opacity group-hover:opacity-100 opacity-50" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 ring-4 ring-black shadow-2xl">
                        <AvatarImage src={user?.avatarUrl} alt={user?.username} className="object-cover" />
                        <AvatarFallback className="bg-brand-medium/20 text-brand-medium font-bold text-3xl">
                          {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-medium text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-black">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                      <h2 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                        {user?.first_name} {user?.last_name}
                        {user?.isVerified && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </h2>
                      <p className="text-brand-medium font-medium">@{user?.username}</p>
                      <p className="text-white/40 text-sm mt-1">{user?.email}</p>
                      {user?.bio && <p className="text-white/70 text-sm mt-3 line-clamp-2 max-w-md">{user.bio}</p>}
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="rounded-3xl bg-black/20 border border-white/[0.04] p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
                    <Sparkles className="w-5 h-5 text-brand-medium" />
                    <h3 className="text-lg font-bold text-white">Personal Information</h3>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs font-bold text-white/50 uppercase tracking-wider">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane"
                          className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base rounded-xl transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs font-bold text-white/50 uppercase tracking-wider">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                          className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base rounded-xl transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-bold text-white/50 uppercase tracking-wider">Username</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">@</span>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))} placeholder="username"
                          className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base pl-9 rounded-xl transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="bio" className="text-xs font-bold text-white/50 uppercase tracking-wider">Bio</Label>
                        <span className={`text-xs font-mono ${bio.length > 150 ? 'text-amber-500' : 'text-white/30'}`}>{bio.length}/160</span>
                      </div>
                      <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world about yourself..."
                        rows={4} maxLength={160} className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 text-base rounded-xl resize-none transition-all p-4 leading-relaxed" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Gender</Label>
                        <Select value={gender} onValueChange={(val) => setGender(val ?? '')}>
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base rounded-xl transition-all">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10 rounded-xl shadow-2xl">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthdate" className="text-xs font-bold text-white/50 uppercase tracking-wider">Birthdate</Label>
                        <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base rounded-xl transition-all [color-scheme:dark]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-xs font-bold text-white/50 uppercase tracking-wider">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country"
                            className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base pl-10 rounded-xl transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs font-bold text-white/50 uppercase tracking-wider">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <Input id="website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="yoursite.com"
                            className="bg-white/5 border-white/10 focus:border-brand-medium focus:ring-brand-medium/20 h-11 text-base pl-10 rounded-xl transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.04] flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile}
                        className="rounded-full bg-brand-medium hover:bg-brand-medium/90 text-white h-11 px-8 font-bold flex items-center gap-2 shadow-lg shadow-brand-medium/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ══════════════ SECURITY TAB ══════════════ */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                
                {/* 2FA Section */}
                <div className="rounded-3xl bg-black/20 border border-white/[0.04] p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                    <Shield className="w-5 h-5 text-brand-medium" />
                    <h3 className="text-lg font-bold text-white">Two-Factor Authentication (2FA)</h3>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04]">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        Login Verification
                        {twoFAEnabled && <span className="px-2 py-0.5 rounded-md bg-brand-medium/20 text-brand-medium text-[10px] uppercase tracking-wider">Active</span>}
                      </h4>
                      <p className="text-sm text-white/40 mt-1 max-w-md leading-relaxed">
                        Add an extra layer of security to your account. We'll send a one-time code to your email when you log in on a new device.
                      </p>
                    </div>

                    {twoFAToken ? (
                      <div className="w-full md:w-auto bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                        <p className="text-xs text-brand-medium font-semibold flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5"/> Check your email for OTP</p>
                        <Input value={twoFAOtp} onChange={(e) => setTwoFAOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000" maxLength={6}
                          className="bg-white/5 border-white/10 focus:border-brand-medium h-10 text-base tracking-[0.5em] font-mono text-center w-full min-w-[200px]" />
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setTwoFAToken(null); setTwoFAOtp(''); }} className="flex-1 rounded-lg">Cancel</Button>
                          <Button size="sm" disabled={isVerifying2FA || twoFAOtp.length !== 6} onClick={handleVerify2FA} className="flex-1 rounded-lg bg-brand-medium hover:bg-brand-medium/90 text-white font-bold">
                            {isVerifying2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant={twoFAEnabled ? 'outline' : 'default'}
                        onClick={() => twoFAEnabled ? setShowDisable2FADialog(true) : handleEnable2FA()}
                        disabled={isEnabling2FA}
                        className={`rounded-full px-6 font-bold h-10 shadow-lg transition-all ${
                          twoFAEnabled 
                            ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                            : 'bg-brand-medium hover:bg-brand-medium/90 text-white shadow-brand-medium/20 hover:scale-[1.02]'
                        }`}
                      >
                        {isEnabling2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Change Password */}
                <div className="rounded-3xl bg-black/20 border border-white/[0.04] p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                    <KeyRound className="w-5 h-5 text-brand-medium" />
                    <h3 className="text-lg font-bold text-white">Change Password</h3>
                  </div>

                  {passwordChangeToken ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl max-w-md mx-auto space-y-4">
                      <div className="text-sm text-amber-500/90 flex gap-2">
                        <KeyRound className="w-5 h-5 shrink-0" />
                        <p>2FA is enabled. Please enter the OTP sent to your email to confirm the password change.</p>
                      </div>
                      <Input value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
                        maxLength={6} className="bg-black/40 border-amber-500/30 focus:border-amber-500 h-12 text-lg tracking-[0.5em] font-mono text-center rounded-xl" />
                      <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => { setPasswordChangeToken(null); setPasswordOtp(''); }} className="rounded-xl">Cancel</Button>
                        <Button disabled={passwordOtp.length !== 6}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold px-6"
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
                          Verify
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Current Password</Label>
                        <div className="relative">
                          <Input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"
                            className="bg-white/5 border-white/10 focus:border-brand-medium h-11 rounded-xl pr-10 transition-all" />
                          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">New Password</Label>
                        <div className="relative">
                          <Input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                            className="bg-white/5 border-white/10 focus:border-brand-medium h-11 rounded-xl pr-10 transition-all" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Confirm Password</Label>
                        <div className="relative">
                          <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                            className="bg-white/5 border-white/10 focus:border-brand-medium h-11 rounded-xl pr-10 transition-all" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {newPassword.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-black/40 border border-white/5">
                          {[
                            { label: '8+ chars', ok: passwordChecks.length },
                            { label: 'Uppercase', ok: passwordChecks.uppercase },
                            { label: 'Lowercase', ok: passwordChecks.lowercase },
                            { label: 'Number', ok: passwordChecks.number },
                            { label: 'Special char', ok: passwordChecks.special },
                            { label: 'Match', ok: passwordChecks.match },
                          ].map(({ label, ok }) => (
                            <div key={label} className="flex items-center gap-2 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-brand-medium/20' : 'bg-white/5'}`}>
                                {ok ? <Check className="w-3 h-3 text-brand-medium" /> : <X className="w-3 h-3 text-white/20" />}
                              </div>
                              <span className={ok ? 'text-white/80' : 'text-white/40'}>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button type="submit" disabled={isChangingPassword}
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white font-bold h-11 px-6 transition-colors flex items-center gap-2">
                        {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update Password
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ SESSIONS TAB ══════════════ */}
            {activeTab === 'sessions' && (
              <div className="rounded-3xl bg-black/20 border border-white/[0.04] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-brand-medium" />
                    <h3 className="text-lg font-bold text-white">Active Sessions</h3>
                  </div>
                  {sessions.length > 1 && (
                    <Button variant="outline" size="sm" onClick={handleLogoutAllDevices}
                      className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 h-9 px-4">
                      <LogOut className="w-4 h-4" />
                      Logout All Devices
                    </Button>
                  )}
                </div>

                {sessionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
                    <p className="text-sm text-white/40">Loading devices...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
                    <p className="text-white/50">No active sessions found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session: any, idx: number) => {
                      const DeviceIcon = getDeviceIcon(session.userAgent || session.deviceName || '');
                      return (
                        <div key={session.id || idx}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                            session.isCurrent
                              ? 'border-brand-medium/30 bg-brand-medium/5'
                              : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            session.isCurrent ? 'bg-brand-medium/20 text-brand-medium' : 'bg-white/5 text-white/40'
                          }`}>
                            <DeviceIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-white flex items-center gap-2 truncate">
                              {session.deviceName || 'Unknown Device'}
                              {session.isCurrent && (
                                <span className="shrink-0 text-[10px] font-bold bg-brand-medium text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Current
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-white/40 mt-1">
                              <span>{session.ipAddress || 'Unknown IP'}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span>{formatSessionDate(session.createdAt)}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ PRIVACY TAB ══════════════ */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                
                <div className="rounded-3xl bg-black/20 border border-white/[0.04] p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                    <Globe className="w-5 h-5 text-brand-medium" />
                    <h3 className="text-lg font-bold text-white">Visibility Settings</h3>
                  </div>

                  <div className="space-y-6">
                    {[
                      { title: 'Private Profile Mode', desc: 'Only approved followers will be able to see your posts.', checked: false },
                      { title: 'Allow Message Requests', desc: 'Let users you don\'t follow send you direct messages.', checked: true },
                      { title: 'Show Activity Status', desc: 'Let others see when you\'re active on the platform.', checked: true },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="pr-4">
                          <p className="text-base font-bold text-white group-hover:text-brand-medium transition-colors">{setting.title}</p>
                          <p className="text-sm text-white/40 mt-1">{setting.desc}</p>
                        </div>
                        <Switch checked={setting.checked} onCheckedChange={() => toast.info('Coming soon!')} className="data-[state=checked]:bg-brand-medium" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-3xl bg-destructive/5 border border-destructive/20 p-6 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-2 border-b border-destructive/20 pb-4 relative z-10">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
                  </div>

                  <div className="relative z-10">
                    <p className="text-sm text-white/60 mb-4 max-w-xl">
                      Once your account is deleted, all of your content, posts, followers, and personal data will be permanently removed. <strong className="text-white">This action cannot be undone.</strong>
                    </p>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}
                      className="rounded-full font-bold px-6 h-10 shadow-lg shadow-destructive/20 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent className="max-w-md bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Disable 2FA
            </DialogTitle>
            <DialogDescription className="text-sm text-white/50 pt-2">
              This will remove the extra security layer. Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Confirm Password</Label>
            <Input type="password" value={disable2FAPassword} onChange={(e) => setDisable2FAPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black/50 border-white/10 focus:border-brand-medium h-12 text-base rounded-xl" />
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button variant="ghost" onClick={() => { setShowDisable2FADialog(false); setDisable2FAPassword(''); }} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" disabled={isDisabling2FA || !disable2FAPassword} onClick={handleDisable2FA}
              className="rounded-xl font-bold flex items-center gap-2 px-6">
              {isDisabling2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-950/90 backdrop-blur-xl border border-destructive/30 rounded-3xl p-6 shadow-2xl shadow-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-sm text-white/50 pt-2 leading-relaxed">
              This will permanently delete your account, all posts, media, likes, comments, and followers. This action <strong className="text-white">cannot be reversed</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Reason for leaving (Optional)</Label>
              <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={2}
                placeholder="We'd love to know why you're leaving..."
                className="bg-black/50 border-white/10 focus:border-destructive/50 text-base rounded-xl resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">Password *</Label>
              <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-black/50 border-white/10 focus:border-destructive/50 h-12 text-base rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                Type <span className="text-destructive font-black">DELETE</span> to confirm
              </Label>
              <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-black/50 border-white/10 focus:border-destructive/50 h-12 text-base font-mono tracking-widest rounded-xl text-center" />
            </div>
          </div>
          <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <Button variant="ghost" onClick={() => { setDeleteDialogOpen(false); setDeletePassword(''); setDeleteConfirmText(''); setDeleteReason(''); }} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" disabled={isDeletingAccount || deleteConfirmText !== 'DELETE' || !deletePassword} onClick={handleDeleteAccount}
              className="rounded-xl font-bold flex items-center gap-2 px-6">
              {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
