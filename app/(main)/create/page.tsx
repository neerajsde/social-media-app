'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Video, Globe, Users, Lock, ChevronDown, Plus, Sparkles, Hash, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'reel'>('text');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [musicName, setMusicName] = useState('');
  const [musicUrl, setMusicUrl] = useState('');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleMockUpload = (type: 'image' | 'video') => {
    if (type === 'image') {
      const mockImages = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=60'
      ];
      const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
      setImages([...images, randomImg]);
      toast.success('Mock S3 Image direct upload succeeded');
    } else {
      setMediaUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      toast.success('Mock S3 Video direct upload succeeded');
    }
  };

  const handleSubmit = (status: 'active' | 'draft') => {
    if (postType === 'text' && !content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    if (postType === 'image' && images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    if ((postType === 'video' || postType === 'reel') && !mediaUrl) {
      toast.error('Please upload a video file');
      return;
    }

    toast.success(status === 'active' ? 'Post published successfully' : 'Saved as draft');
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h1 className="text-xl font-bold">Create Post</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSubmit('draft')}>
            Save Draft
          </Button>
          <Button size="sm" className="bg-brand-dark hover:bg-brand-dark/95 text-brand-lightest" onClick={() => handleSubmit('active')}>
            Publish
          </Button>
        </div>
      </div>

      <Tabs value={postType} onValueChange={(v) => setPostType(v as any)} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/60 p-1">
          <TabsTrigger value="text" className="text-xs sm:text-sm">Text</TabsTrigger>
          <TabsTrigger value="image" className="text-xs sm:text-sm">Image</TabsTrigger>
          <TabsTrigger value="video" className="text-xs sm:text-sm">Video</TabsTrigger>
          <TabsTrigger value="reel" className="text-xs sm:text-sm">Reel</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          {/* Post settings row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 bg-accent/60 px-3 py-1.5 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-medium" />
              <span>Post target: Feeds</span>
            </div>

            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger className="w-[130px] h-8 rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-muted-foreground" /> Public</div>
                </SelectItem>
                <SelectItem value="followers">
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted-foreground" /> Followers</div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-muted-foreground" /> Private</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Core editor text */}
          <div className="space-y-2">
            <Label htmlFor="post-content" className="sr-only">Caption / Post Content</Label>
            <Textarea
              id="post-content"
              placeholder="What is on your mind? Share updates, technical insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] resize-none border-none p-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground bg-transparent"
            />
          </div>

          {/* Post Type Specific Uploaders */}
          {postType === 'image' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">Photos (Up to 10)</Label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 w-6 h-6 rounded-full" onClick={() => setImages(images.filter((_, i) => i !== idx))}>
                      &times;
                    </Button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button type="button" onClick={() => handleMockUpload('image')} className="aspect-square border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Image className="w-6 h-6" />
                    <span className="text-[10px]">Add Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {postType === 'video' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">Video Clip</Label>
              {mediaUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-[16/9]">
                  <video src={mediaUrl} controls className="w-full h-full object-cover" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 text-xs" onClick={() => setMediaUrl('')}>
                    Remove
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => handleMockUpload('video')} className="w-full aspect-[16/9] border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Video className="w-7 h-7" />
                  <span className="text-xs">Upload Video File</span>
                </button>
              )}
            </div>
          )}

          {postType === 'reel' && (
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-muted-foreground">Short Reel Clip</Label>
              {mediaUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-[9/16] max-w-[200px] mx-auto bg-black">
                  <video src={mediaUrl} controls className="w-full h-full object-contain" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 text-xs" onClick={() => setMediaUrl('')}>
                    Remove
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => handleMockUpload('video')} className="w-full aspect-[9/16] max-w-[200px] mx-auto border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/20">
                  <Video className="w-7 h-7" />
                  <span className="text-xs">Upload Reel (9:16)</span>
                </button>
              )}

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs font-semibold">Background Music Options</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="musicName" className="text-xs text-muted-foreground">Track Name</Label>
                    <Input id="musicName" placeholder="e.g. Summer Breeze" value={musicName} onChange={(e) => setMusicName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="musicUrl" className="text-xs text-muted-foreground">Audio URL</Label>
                    <Input id="musicUrl" placeholder="https://example.com/audio.mp3" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Tags manager */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" /> Tagged Topics
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest text-xs px-2.5 py-1 rounded-full">
                  #{tag}
                  <button type="button" className="hover:text-destructive text-sm" onClick={() => handleRemoveTag(tag)}>&times;</button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <Input
                placeholder="Add topical tag (press enter)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="max-w-[240px] h-8 text-xs"
              />
              <Button type="submit" variant="secondary" size="sm" className="h-8">
                Add Tag
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
