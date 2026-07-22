'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Video as VideoIcon, Globe, Users, Lock, Sparkles, Hash, Loader2, X, PlusSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCreatePostMutation, useGeneratePostPresignedUrlMutation } from '@/lib/features/post/postApi';
import { useLazySearchQuery } from '@/lib/features/search/searchApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'reel'>('text');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Markdown and Mentions state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState<{ start: number, end: number } | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  
  const [searchTrigger] = useLazySearchQuery();

  // Handle type param initialization from url
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type') as any;
      if (['text', 'image', 'video', 'reel'].includes(typeParam)) {
        setPostType(typeParam);
      }
    }
  }, []);

  // S3 upload and Preview states
  const [images, setImages] = useState<{ key: string; previewUrl: string }[]>([]);
  const [mediaKey, setMediaKey] = useState('');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [musicName, setMusicName] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [generatePresignedUrl] = useGeneratePostPresignedUrlMutation();
  const [createPost, { isLoading: isPublishing }] = useCreatePostMutation();

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

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading media to storage...');

    try {
      if (postType === 'image') {
        const fileList = Array.from(files).slice(0, 10 - images.length);
        const mimeTypes = fileList.map((f) => f.type);

        const response = await generatePresignedUrl({ postType: 'image', mimeTypes }).unwrap();
        const uploadedKeys: { key: string; previewUrl: string }[] = [];

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const uploadInfo = response.data[i];

          if (!uploadInfo) continue;

          await fetch(uploadInfo.url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });

          uploadedKeys.push({
            key: uploadInfo.key,
            previewUrl: URL.createObjectURL(file),
          });
        }

        setImages((prev) => [...prev, ...uploadedKeys]);
        toast.success('Images uploaded successfully', { id: toastId });
      } else if (postType === 'video' || postType === 'reel') {
        const file = files[0];
        if (!file) return;

        const response = (await generatePresignedUrl({ postType, mimeTypes: file.type }).unwrap()) as any;

        await fetch(response.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        setMediaKey(response.fileKey);
        setMediaPreviewUrl(URL.createObjectURL(file));
        toast.success(`${postType === 'video' ? 'Video' : 'Reel'} uploaded successfully`, { id: toastId });
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      toast.error('Upload failed', {
        description: err?.data?.message || 'Could not upload file to storage.',
        id: toastId,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (status: 'active' | 'draft') => {
    if (postType === 'text' && !content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    if (postType === 'image' && images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    if ((postType === 'video' || postType === 'reel') && !mediaKey) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      const keys = images.map((img) => img.key);
      await createPost({
        postType,
        content: content.trim() || undefined,
        visibility,
        status,
        images: postType === 'image' ? keys : undefined,
        mediaUrl: postType === 'video' || postType === 'reel' ? mediaKey : undefined,
        musicName: postType === 'reel' ? musicName || 'Original Audio' : undefined,
        musicUrl: postType === 'reel' ? musicUrl || 'https://backend.neerajprajapati.in/original-audio.mp3' : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }).unwrap();

      toast.success(status === 'active' ? 'Post published successfully!' : 'Saved as draft');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error('Failed to publish post', {
        description: err?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="w-full max-w-2xl border-x border-white/5 bg-[#111111] min-h-screen">
      <div className="sticky top-0 z-20 bg-[#111111]/80 backdrop-blur-2xl border-b border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <PlusSquare className="w-4.5 h-4.5 text-brand-medium" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-white/90">Create Post</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSubmit('draft')} disabled={isPublishing || isUploading} className="h-8 rounded-full border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            Save Draft
          </Button>
          <Button size="sm" className="bg-brand-medium hover:bg-brand-medium/90 text-white h-8 rounded-full px-4" onClick={() => handleSubmit('active')} disabled={isPublishing || isUploading}>
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">

      <Tabs value={postType} onValueChange={(v) => {
        setPostType(v as any);
        // Clear media states on tab change to prevent mixed content
        setImages([]);
        setMediaKey('');
        setMediaPreviewUrl('');
      }} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/60 p-1">
          <TabsTrigger value="text" className="text-xs sm:text-sm">Text</TabsTrigger>
          <TabsTrigger value="image" className="text-xs sm:text-sm">Image</TabsTrigger>
          <TabsTrigger value="video" className="text-xs sm:text-sm">Video</TabsTrigger>
          <TabsTrigger value="reel" className="text-xs sm:text-sm">Reel</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4 bg-card/5">
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
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="post-content" className="sr-only">Caption / Post Content</Label>
              <div className="flex bg-muted/60 rounded-md p-0.5 ml-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-3 text-xs rounded-sm ${!isPreviewMode ? 'bg-background shadow-sm' : ''}`}
                  onClick={() => setIsPreviewMode(false)}
                >
                  Write
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-3 text-xs rounded-sm ${isPreviewMode ? 'bg-background shadow-sm' : ''}`}
                  onClick={() => setIsPreviewMode(true)}
                >
                  Preview
                </Button>
              </div>
            </div>

            {isPreviewMode ? (
              <div className="min-h-[140px] p-4 bg-muted/20 rounded-md border border-border/50 prose prose-sm dark:prose-invert max-w-none">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground italic">Nothing to preview</span>
                )}
              </div>
            ) : (
              <Textarea
                id="post-content"
                placeholder={
                  postType === 'text'
                    ? 'What is on your mind? Share updates, technical insights... (Markdown supported, type @ to mention)'
                    : 'Add a premium caption to your post... (Markdown supported, type @ to mention)'
                }
                value={content}
                onChange={(e) => {
                  const val = e.target.value;
                  setContent(val);
                  
                  // Mention detection logic
                  const cursorPosition = e.target.selectionStart;
                  const textBeforeCursor = val.slice(0, cursorPosition);
                  const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
                  
                  if (match) {
                    const query = match[1];
                    setMentionQuery(query);
                    setMentionIndex({ start: cursorPosition - query.length - 1, end: cursorPosition });
                    
                    searchTrigger({ q: query, type: 'account', limit: 5 }).unwrap()
                      .then((res) => {
                        if (res.success && res.data) {
                          setMentionResults(res.data);
                        }
                      })
                      .catch((err) => console.error("Mention search failed", err));
                  } else {
                    setMentionQuery(null);
                    setMentionResults([]);
                  }
                }}
                className="min-h-[140px] resize-none border-none p-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground bg-transparent font-sans"
              />
            )}
            
            {/* Mention Dropdown */}
            {mentionQuery !== null && mentionResults.length > 0 && !isPreviewMode && (
              <div className="absolute z-50 mt-1 w-64 bg-background border border-border/60 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl bottom-full mb-2 left-0">
                <div className="p-2 text-xs font-semibold text-muted-foreground bg-muted/30">Mentions</div>
                <div className="max-h-[200px] overflow-y-auto">
                  {mentionResults.map((user: any) => (
                    <div 
                      key={user.id} 
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (mentionIndex) {
                          const newText = content.substring(0, mentionIndex.start) + 
                            `[@${user.username}](/profile/${user.username}) ` + 
                            content.substring(mentionIndex.end);
                          setContent(newText);
                          setMentionQuery(null);
                          setMentionResults([]);
                        }
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="text-xs bg-brand-medium/20">{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple={postType === 'image'}
            accept={postType === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm,video/mov'}
            className="hidden"
          />

          {/* Post Type Specific Uploaders */}
          {postType === 'image' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">Photos (Up to 10)</Label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 w-6 h-6 rounded-full" onClick={() => setImages(images.filter((_, i) => i !== idx))}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    disabled={isUploading}
                    className="aspect-square border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    <span className="text-[10px]">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {postType === 'video' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">Video Clip</Label>
              {mediaPreviewUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-[16/9]">
                  <video src={mediaPreviewUrl} controls className="w-full h-full object-cover" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 text-xs" onClick={() => { setMediaKey(''); setMediaPreviewUrl(''); }}>
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  disabled={isUploading}
                  className="w-full aspect-[16/9] border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-brand-medium" />
                  ) : (
                    <VideoIcon className="w-7 h-7" />
                  )}
                  <span className="text-xs">{isUploading ? 'Uploading video to S3...' : 'Upload Video File'}</span>
                </button>
              )}
            </div>
          )}

          {postType === 'reel' && (
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-muted-foreground">Short Reel Clip</Label>
              {mediaPreviewUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-[9/16] max-w-[200px] mx-auto bg-black">
                  <video src={mediaPreviewUrl} controls className="w-full h-full object-contain" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 text-xs" onClick={() => { setMediaKey(''); setMediaPreviewUrl(''); }}>
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  disabled={isUploading}
                  className="w-full aspect-[9/16] max-w-[200px] mx-auto border border-dashed border-border hover:border-brand-medium rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/20 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-brand-medium" />
                  ) : (
                    <VideoIcon className="w-7 h-7" />
                  )}
                  <span className="text-xs">{isUploading ? 'Uploading reel...' : 'Upload Reel (9:16)'}</span>
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
                <span key={tag} className="inline-flex items-center gap-1 bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest text-xs px-2.5 py-1 rounded-full font-medium">
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
                className="max-w-[240px] h-8 text-xs focus-visible:ring-brand-medium"
              />
              <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs">
                Add Tag
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
