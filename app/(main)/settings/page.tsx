'use client';

import { useState } from 'react';
import { Settings, User, Shield, Lock, Bell, Trash2, KeyRound, Globe, CloudLightning } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Chen',
    username: 'sarah_creates',
    email: 'sarah@example.com',
    bio: 'Digital artist and photographer. Capturing moments that matter.',
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    activityLog: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Your password has been changed');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    toast.success('Your account deletion request has been registered.');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Settings className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col bg-muted/60 p-1 md:w-[200px] shrink-0 h-auto justify-start items-stretch gap-1">
          <TabsTrigger value="profile" className="justify-start gap-2 py-2.5 px-3 text-xs md:text-sm font-medium">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start gap-2 py-2.5 px-3 text-xs md:text-sm font-medium">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="justify-start gap-2 py-2.5 px-3 text-xs md:text-sm font-medium">
            <Globe className="w-4 h-4" /> Privacy & Safety
          </TabsTrigger>
        </TabsList>

        <div className="flex-grow">
          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-0">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Account Profile</CardTitle>
                <CardDescription>Update your personal information and bio card appearance.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio description</Label>
                    <Input id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                  </div>
                  <Button type="submit" className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-0 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Maintain account security by changing passwords periodically.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currPass">Current Password</Label>
                    <Input id="currPass" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confPass">Confirm New Password</Label>
                    <Input id="confPass" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  </div>
                  <Button type="submit" className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-medium" /> two-factor authentication (2FA)
                </CardTitle>
                <CardDescription>Require a temporary security token code sent via email upon login.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Enable 2FA login verification</p>
                    <p className="text-xs text-muted-foreground">Keep your account safe from unauthorized login attempts.</p>
                  </div>
                  <Switch checked={security.twoFactor} onCheckedChange={(val) => { setSecurity({ ...security, twoFactor: val }); toast.success('2FA setting updated'); }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Safety Tab */}
          <TabsContent value="privacy" className="mt-0 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Visibility Settings</CardTitle>
                <CardDescription>Control who can view your posts and engage with items.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Private Profile Mode</p>
                    <p className="text-xs text-muted-foreground">Only approved followers will be able to see your posts.</p>
                  </div>
                  <Switch checked={false} onCheckedChange={() => toast.info('Privacy mode toggled')} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Allow Message Requests</p>
                    <p className="text-xs text-muted-foreground">Let users you do not follow request direct messages.</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => toast.info('Messages permission updated')} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 border">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account deletion actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger render={<Button variant="destructive" className="w-full sm:w-auto" />}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely certain?</DialogTitle>
                      <DialogDescription>This action will queue your account for removal. All databases records, posts, media assets, likes, comments will be permanently erased.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>Confirm Deletion</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
