'use client';

import { use, useState, useEffect, useRef } from 'react';
import LinkNext from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  MapPin,
  LinkIcon,
  CalendarDays,
  ArrowLeft,
  Grid3x3,
  Bookmark,
  Film,
  Camera,
  Loader2,
  Globe,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PostCard from '@/components/shared/PostCard';
import AuthDialog from '@/components/shared/AuthDialog';
import VideoUploadBanner from '@/components/shared/VideoUploadBanner';
import { formatCount } from '@/lib/mock-data';
import {
  useGetUserProfileByUsernameQuery,
  useUpdateProfileMutation,
  useUpdateSocialLinksMutation,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
  useGeneratePresignedUrlMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/lib/features/user/userApi';
import { useGetUserPostsQuery } from '@/lib/features/post/postApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/media-url';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [tab, setTab] = useState('posts');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data, isLoading, error } = useGetUserProfileByUsernameQuery(username);
  const user = data?.user;

  const { data: postsData, isLoading: postsLoading } = useGetUserPostsQuery(
    { userId: user?.id ?? '' },
    { skip: !user?.id }
  );
  const userPosts = postsData?.posts ?? [];

  // Redux auth
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isOwner = currentUser?.username === user?.username;

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateSocialLinks] = useUpdateSocialLinksMutation();
  const [updateAvatar] = useUpdateAvatarMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [generatePresignedUrl] = useGeneratePresignedUrlMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Follow states
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [followersCountState, setFollowersCountState] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Dialog Form states
  const [editOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Sync state on load
  useEffect(() => {
    if (user) {
      setIsFollowingState(!!user.isFollowing);
      setFollowersCountState(user.follower ?? user.followersCount ?? 0);
    }
  }, [user]);

  useEffect(() => {
    if (user && editOpen) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setBio(user.bio ?? '');
      setGender(user.profile?.gender ?? '');
      setBirthdate(user.profile?.birthdate ? new Date(user.profile.birthdate).toISOString().split('T')[0] : '');
      setLocation(user.profile?.location ?? '');
      setWebsiteUrl(user.profile?.websiteUrl ?? '');
    }
  }, [user, editOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-medium" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The user @{username} does not exist or has been suspended.
        </p>
        <LinkNext href="/">
          <Button>Back to Home</Button>
        </LinkNext>
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    try {
      if (isFollowingState) {
        setIsFollowingState(false);
        setFollowersCountState((prev) => Math.max(0, prev - 1));
        await unfollowUser(user.id).unwrap();
        toast.success(`Unfollowed @${user.username}`);
      } else {
        setIsFollowingState(true);
        setFollowersCountState((prev) => prev + 1);
        await followUser(user.id).unwrap();
        toast.success(`Followed @${user.username}`);
      }
    } catch (err) {
      // Rollback
      setIsFollowingState(!!user.isFollowing);
      setFollowersCountState(user.follower ?? user.followersCount ?? 0);
      toast.error('Failed to update follow status');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end UI validations
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters long.');
      return;
    }
    if (lastName.trim() && lastName.trim().length < 2) {
      toast.error('Last name must be at least 2 characters long.');
      return;
    }
    if (bio.trim().length > 160) {
      toast.error('Bio must be at most 160 characters long.');
      return;
    }
    if (location.trim().length > 100) {
      toast.error('Location must be at most 100 characters long.');
      return;
    }

    let formattedWebsiteUrl = websiteUrl.trim();
    if (formattedWebsiteUrl) {
      if (!formattedWebsiteUrl.startsWith('http://') && !formattedWebsiteUrl.startsWith('https://')) {
        formattedWebsiteUrl = `https://${formattedWebsiteUrl}`;
      }
      try {
        new URL(formattedWebsiteUrl);
      } catch (_) {
        toast.error('Please enter a valid website URL.');
        return;
      }
    }

    const toastId = toast.loading('Saving profile changes...');
    try {
      const birthdatePayload = birthdate ? new Date(birthdate).toISOString() : null;

      await updateProfile({
        username: user.username,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        bio: bio.trim() || null,
        gender: gender || null,
        birthdate: birthdatePayload,
        location: location.trim() || null,
      }).unwrap();

      if (formattedWebsiteUrl !== (user.profile?.websiteUrl ?? '')) {
         await updateSocialLinks({ websiteUrl: formattedWebsiteUrl || null }).unwrap();
      }

      toast.success('Profile updated successfully', { id: toastId });
      setEditOpen(false);
    } catch (err: any) {
      console.error('Update profile error:', err);
      let errorMsg = 'Failed to update profile';
      if (err?.data?.errors) {
        const errorList = Object.entries(err.data.errors)
          .map(([field, msgs]) => `${field.replace('_', ' ')}: ${(msgs as string[]).join(', ')}`)
          .join('\n');
        errorMsg = err.data.message ? `${err.data.message}:\n${errorList}` : errorList;
      } else if (err?.data?.message) {
        errorMsg = err.data.message;
      }
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading new avatar...');
    try {
      const response = await generatePresignedUrl({ mimeType: file.type }).unwrap();
      await fetch(response.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await updateAvatar({ fileKey: response.fileKey }).unwrap();
      toast.success('Avatar updated successfully', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to upload avatar', { id: toastId });
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading new cover image...');
    try {
      const response = await generatePresignedUrl({ mimeType: file.type }).unwrap();
      await fetch(response.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await updateBanner({ fileKey: response.fileKey }).unwrap();
      toast.success('Cover image updated successfully', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to upload cover', { id: toastId });
    }
  };

  const formattedJoinedDate = () => {
    if (!user.createdAt) return 'Joined recently';
    try {
      const date = new Date(user.createdAt);
      return `Joined ${date.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`;
    } catch (_) {
      return 'Joined recently';
    }
  };

  return (
    <div className="w-full max-w-2xl border-x border-white/5 bg-[#111111] min-h-screen pb-10">
      {/* Premium Header */}
      <div 
        className="sticky top-0 z-20 bg-[#111111]/80 backdrop-blur-2xl border-b border-white/5 cursor-pointer hover:bg-[#111111]/90 transition-all duration-300 group/header"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="px-4 py-3 flex items-center gap-4">
          <LinkNext href="/" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4.5 h-4.5 text-white/90" />
            </Button>
          </LinkNext>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-white/90 flex items-center gap-1.5 leading-tight">
              {user.first_name || user.username} {user.last_name || ''}
              {user.isVerified && (
                <span className="text-blue-500 inline-block" title="Verified Creator">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">{user.postCount ?? 0} posts</p>
          </div>
        </div>
      </div>

      {isOwner && <VideoUploadBanner />}

      {/* Banner */}
      <div className="relative group">
        <div className="h-32 sm:h-44 bg-gradient-to-r from-[#17c964]to-[#0072f5] overflow-hidden relative border-b border-border">
          {user.bannerUrl ? (
            <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-brand-dark/45 to-brand-medium/55" />
          )}

          {isOwner && (
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white transition-opacity duration-200"
            >
              <Camera className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Change Cover</span>
            </button>
          )}
        </div>
        <input
          type="file"
          ref={bannerInputRef}
          onChange={handleBannerChange}
          accept="image/*"
          className="hidden"
        />

        {/* Avatar */}
        <div className="absolute -bottom-12 left-4 z-10 group/avatar">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-background bg-background shadow-lg">
            <Avatar className="w-full h-full">
              <AvatarImage src={user.avatarUrl} alt={user.username} className="object-cover" />
              <AvatarFallback className="bg-brand-medium text-white text-xl font-bold flex items-center justify-center">
                {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {isOwner && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-1.5 text-foreground">
              {user.first_name || user.username} {user.last_name || ''}
              {user.isVerified && (
                <span className="text-blue-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground block">@{user.username}</p>
          </div>

          {isOwner ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="rounded-full border-border hover:bg-muted text-xs font-semibold px-4 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowingState ? 'secondary' : 'default'}
              size="sm"
              onClick={handleFollowToggle}
              className="rounded-full font-semibold px-5 text-xs"
            >
              {isFollowingState ? 'Following' : user.followsYou ? 'Follow Back' : 'Follow'}
            </Button>
          )}
        </div>

        {user.bio ? (
          <p className="text-sm mb-3 leading-relaxed text-foreground/90 whitespace-pre-wrap">{user.bio}</p>
        ) : (
          isOwner && <p className="text-xs text-muted-foreground italic mb-3">Add a bio to tell others about yourself.</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3 font-medium">
          {user.profile?.location && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {user.profile.location}
            </span>
          )}
          {user.profile?.websiteUrl && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <a
                href={user.profile.websiteUrl.startsWith('http') ? user.profile.websiteUrl : `https://${user.profile.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-medium hover:underline flex items-center"
              >
                {user.profile.websiteUrl.replace(/(^\w+:|^)\/\//, '')}
              </a>
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            {formattedJoinedDate()}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-2">
          <LinkNext href={`/profile/${user.username}/following`} className="hover:underline flex gap-1 items-center">
            <span className="font-bold text-foreground text-sm">{formatCount(user.following ?? 0)}</span>
            <span>Following</span>
          </LinkNext>
          <LinkNext href={`/profile/${user.username}/followers`} className="hover:underline flex gap-1 items-center">
            <span className="font-bold text-foreground text-sm">{formatCount(followersCountState)}</span>
            <span>Followers</span>
          </LinkNext>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full bg-transparent justify-start rounded-none border-b border-border p-0 h-auto gap-0">
          {[
            { value: 'posts', icon: Grid3x3, label: 'Posts' },
            { value: 'media', icon: Film, label: 'Media' },
            { value: 'saved', icon: Bookmark, label: 'Saved' },
          ].map(({ value, icon: Icon, label }) => {
            const isTabActive = tab === value;
            return (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground"
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="p-4 space-y-4">
        {tab === 'posts' && (
          postsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
            </div>
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-16 space-y-2 border border-dashed border-border rounded-xl">
              <Grid3x3 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-base font-semibold text-foreground">No posts yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isOwner ? "When you publish updates, photos, or videos, they'll show up here." : "This creator hasn't published any posts yet."}
              </p>
            </div>
          )
        )}

        {tab === 'media' && (
          postsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
            </div>
          ) : userPosts.filter((p) => p.images?.length || p.video?.hlsMasterKey || p.video?.originalVideo).length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {userPosts
                .filter((p) => p.images?.length || p.video?.hlsMasterKey || p.video?.originalVideo)
                .map((post) => {
                  const mediaUrl = post.images?.length ? post.images[0] : post.video?.thumbnail;
                  return (
                    <LinkNext key={post.id} href={`/post/${post.id}`} className="aspect-square overflow-hidden rounded-lg bg-muted relative group">
                      {mediaUrl ? (
                        <img
                          src={getMediaUrl(mediaUrl)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-muted-foreground">
                          Media Post
                        </div>
                      )}
                    </LinkNext>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2 border border-dashed border-border rounded-xl">
              <Film className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-base font-semibold text-foreground">No media posts</p>
              <p className="text-xs text-muted-foreground">Creatives containing photos or videos will be listed here.</p>
            </div>
          )
        )}

        {tab === 'saved' && (
          <div className="text-center py-16 space-y-2 border border-dashed border-border rounded-xl">
            <Bookmark className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-base font-semibold text-foreground">Nothing saved</p>
            <p className="text-xs text-muted-foreground">Save interesting posts to access them quickly anytime.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-foreground">Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold text-zinc-400">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold text-zinc-400">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio" className="text-xs font-semibold text-zinc-400">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-xs font-semibold text-zinc-400">Gender</Label>
                <Select value={gender} onValueChange={(val) => setGender(val || '')}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-foreground">
                    <SelectItem value="male" className="text-xs hover:bg-zinc-800">Male</SelectItem>
                    <SelectItem value="female" className="text-xs hover:bg-zinc-800">Female</SelectItem>
                    <SelectItem value="other" className="text-xs hover:bg-zinc-800">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="birthdate" className="text-xs font-semibold text-zinc-400">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold text-zinc-400">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="websiteUrl" className="text-xs font-semibold text-zinc-400">Website</Label>
                <Input
                  id="websiteUrl"
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. portfolio.com"
                  className="bg-zinc-900 border-zinc-800 focus:border-brand-medium text-foreground rounded-lg h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
                className="rounded-full hover:bg-muted text-xs px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="rounded-full bg-brand-medium text-white hover:bg-brand-medium/95 text-xs px-5 flex items-center gap-1.5"
              >
                {isUpdatingProfile && <Loader2 className="w-3 h-3 animate-spin text-white" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
