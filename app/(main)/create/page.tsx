'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Video as VideoIcon, Globe, Users, Lock, Sparkles, Hash, Loader2, X, FileText, Music, UploadCloud, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreatePostMutation, useGeneratePostPresignedUrlMutation } from '@/lib/features/post/postApi';
import { useLazySearchQuery } from '@/lib/features/search/searchApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { startVideoUpload } from '@/lib/features/post/videoUploadSlice';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [generatePresignedUrl] = useGeneratePostPresignedUrlMutation();
  const [createPost, { isLoading: isPublishing }] = useCreatePostMutation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    let files: FileList | null = null;
    
    if ('dataTransfer' in e) {
      files = e.dataTransfer.files;
    } else if (e.target instanceof HTMLInputElement) {
      files = e.target.files;
    }

    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading('Uploading media to storage...');

    const uploadFileWithProgress = (url: string, file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });
    };

    try {
      if (postType === 'video' || postType === 'reel') {
        const file = files[0];
        if (file) {
          const MAX_VIDEO_SIZE = 1 * 1024 * 1024 * 1024; // 1GB
          if (file.size > MAX_VIDEO_SIZE) {
            toast.error('Video size must be less than 1GB', { id: toastId });
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }
        }
      }

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

        await uploadFileWithProgress(response.uploadUrl, file);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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
      const res = await createPost({
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

      if ((postType === 'video' || postType === 'reel') && res.postId && status === 'active') {
        dispatch(startVideoUpload({ postId: res.postId }));
        toast.success('Video upload started! You can track progress in the feed.');
        router.push('/');
      } else {
        toast.success(status === 'active' ? 'Post published successfully!' : 'Saved as draft');
        router.push('/');
      }
    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error('Failed to publish post', {
        description: err?.data?.message || 'Something went wrong',
      });
    }
  };

  const postTypes = [
    { id: 'text', icon: FileText, label: 'Text', desc: 'Share your thoughts' },
    { id: 'image', icon: ImageIcon, label: 'Image', desc: 'Post beautiful photos' },
    { id: 'video', icon: VideoIcon, label: 'Video', desc: 'Upload a cinematic video' },
    { id: 'reel', icon: Music, label: 'Reel', desc: 'Share a short vertical clip' },
  ];

  return (
    <div className="w-full max-w-2xl border-x border-white/5 bg-[#111111] min-h-screen pb-12">
      {/* Premium Header */}
      <div className="sticky top-0 z-20 bg-[#111111]/80 backdrop-blur-2xl border-b border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-medium/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-brand-medium" />
          </div>
          <h1 className="text-xl font-bold font-heading tracking-tight text-white/90">Create Post</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
            <SelectTrigger className="w-[120px] h-9 rounded-full bg-white/5 border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="public"><div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-brand-medium" /> Public</div></SelectItem>
              <SelectItem value="followers"><div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-brand-medium" /> Followers</div></SelectItem>
              <SelectItem value="private"><div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-brand-medium" /> Private</div></SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => handleSubmit('draft')} disabled={isPublishing || isUploading} className="h-9 rounded-full border-white/10 bg-transparent text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold">
            Draft
          </Button>
          <Button size="sm" onClick={() => handleSubmit('active')} disabled={isPublishing || isUploading} className="bg-brand-medium hover:bg-brand-medium/90 text-white h-9 rounded-full px-5 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-medium/20">
            {isPublishing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing</>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Dynamic Post Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {postTypes.map((pt) => {
            const Icon = pt.icon;
            const isActive = postType === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => {
                  setPostType(pt.id as any);
                  setImages([]);
                  setMediaKey('');
                  setMediaPreviewUrl('');
                }}
                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 ease-out border ${
                  isActive 
                    ? 'bg-brand-medium/10 border-brand-medium/50 shadow-lg shadow-brand-medium/10 scale-[1.02]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                }`}
              >
                <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-brand-medium' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <p className={`text-sm font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{pt.label}</p>
                </div>
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-medium/20 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Glassmorphic Editor Area */}
        <div className="space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group/editor focus-within:ring-1 focus-within:ring-brand-medium/50 transition-all duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-medium/10 blur-[60px] rounded-full pointer-events-none -mr-10 -mt-10" />

          {/* Core editor text */}
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold text-white/80">Caption</Label>
              <div className="flex bg-black/40 rounded-full p-1 backdrop-blur-md border border-white/10">
                <button 
                  className={`px-4 py-1 text-xs font-semibold rounded-full transition-all ${!isPreviewMode ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                  onClick={() => setIsPreviewMode(false)}
                >
                  Write
                </button>
                <button 
                  className={`px-4 py-1 text-xs font-semibold rounded-full transition-all ${isPreviewMode ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                  onClick={() => setIsPreviewMode(true)}
                >
                  Preview
                </button>
              </div>
            </div>

            {isPreviewMode ? (
              <div className="min-h-[120px] p-4 bg-black/30 rounded-2xl border border-white/5 prose prose-sm dark:prose-invert max-w-none text-white/90">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <span className="text-white/40 italic">Nothing to preview</span>
                )}
              </div>
            ) : (
              <Textarea
                placeholder={
                  postType === 'text'
                    ? 'What\'s on your mind? Start typing... (Markdown supported, type @ to mention)'
                    : 'Add a captivating caption to your post... (Markdown supported, type @ to mention)'
                }
                value={content}
                onChange={(e) => {
                  const val = e.target.value;
                  setContent(val);
                  
                  // Mention detection
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
                className="min-h-[120px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0 text-base sm:text-lg placeholder:text-white/30 text-white/90 font-sans"
              />
            )}
            
            {/* Mention Dropdown */}
            {mentionQuery !== null && mentionResults.length > 0 && !isPreviewMode && (
              <div className="absolute z-50 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden bottom-full mb-2 left-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 text-xs font-bold text-white/50 bg-black/40 border-b border-white/5 uppercase tracking-wider">Mentions</div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {mentionResults.map((u: any) => (
                    <div 
                      key={u.id} 
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => {
                        if (mentionIndex) {
                          const newText = content.substring(0, mentionIndex.start) + 
                            `[@${u.username}](/profile/${u.username}) ` + 
                            content.substring(mentionIndex.end);
                          setContent(newText);
                          setMentionQuery(null);
                          setMentionResults([]);
                        }
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.avatarUrl} />
                        <AvatarFallback className="text-xs bg-brand-medium/20 text-brand-medium">{u.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white/90">{u.first_name} {u.last_name}</span>
                        <span className="text-xs text-white/50">@{u.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple={postType === 'image'}
            accept={postType === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm,video/mov'}
            className="hidden"
          />

          {/* Interactive Media Upload Zone */}
          {postType !== 'text' && (
            <div className="relative z-10 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-sm font-bold text-white/80">
                  {postType === 'image' ? 'Photos (Up to 10)' : postType === 'video' ? 'Video File' : 'Reel Video (9:16)'}
                </Label>
              </div>

              {((postType === 'image' && images.length === 0) || (postType !== 'image' && !mediaPreviewUrl)) ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileChange}
                  onClick={handleTriggerFileInput}
                  className={`w-full aspect-[21/9] sm:aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-brand-medium bg-brand-medium/10 scale-[1.02]' 
                      : 'border-white/15 bg-black/20 hover:border-brand-medium/50 hover:bg-white/5'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-[80%] mx-auto animate-in fade-in">
                      <div className="p-4 bg-brand-medium/20 rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-medium" />
                      </div>
                      <div className="w-full space-y-2 text-center">
                        <span className="text-sm font-medium text-brand-medium">Uploading to secure storage... {uploadProgress}%</span>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-brand-medium h-full rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                      <div className="p-4 bg-white/5 rounded-full mb-2">
                        <UploadCloud className="w-8 h-8 text-white/60" />
                      </div>
                      <span className="text-base font-semibold">Click or drag media here</span>
                      <span className="text-xs">
                        {postType === 'image' ? 'PNG, JPG, WEBP, GIF (Max 10)' : 'MP4, WEBM, MOV (Max 1GB)'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  {postType === 'image' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                          <img src={img.previewUrl} alt="Upload preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button variant="destructive" size="icon" className="w-10 h-10 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, i) => i !== idx)); }}>
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {images.length < 10 && (
                        <button
                          type="button"
                          onClick={handleTriggerFileInput}
                          disabled={isUploading}
                          className="aspect-square border border-dashed border-white/20 hover:border-brand-medium bg-black/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/50 hover:text-brand-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <PlusSquare className="w-8 h-8" />
                          )}
                          <span className="text-xs font-semibold">
                            {isUploading ? `Uploading ${uploadProgress}%` : 'Add More'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {postType === 'video' && mediaPreviewUrl && (
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[16/9] shadow-2xl group">
                      <video src={mediaPreviewUrl} controls className="w-full h-full object-cover bg-black" />
                      <Button variant="destructive" className="absolute top-4 right-4 rounded-full px-4 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0" onClick={() => { setMediaKey(''); setMediaPreviewUrl(''); }}>
                        <X className="w-4 h-4 mr-1.5" /> Remove Video
                      </Button>
                    </div>
                  )}

                  {postType === 'reel' && mediaPreviewUrl && (
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[9/16] max-w-[280px] mx-auto shadow-2xl group bg-black">
                      <video src={mediaPreviewUrl} controls className="w-full h-full object-contain" />
                      <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full w-9 h-9 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0" onClick={() => { setMediaKey(''); setMediaPreviewUrl(''); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {postType === 'reel' && (
                <div className="mt-6 space-y-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <Label className="text-sm font-bold flex items-center gap-2 text-white/80">
                    <Music className="w-4 h-4 text-brand-medium" /> Background Audio Options
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="musicName" className="text-xs text-white/50 font-semibold uppercase tracking-wider">Track Name</Label>
                      <Input id="musicName" placeholder="e.g. Summer Vibe" value={musicName} onChange={(e) => setMusicName(e.target.value)} className="bg-white/5 border-white/10 rounded-xl focus-visible:ring-brand-medium/50 h-10 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="musicUrl" className="text-xs text-white/50 font-semibold uppercase tracking-wider">Audio Source URL</Label>
                      <Input id="musicUrl" placeholder="https://..." value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} className="bg-white/5 border-white/10 rounded-xl focus-visible:ring-brand-medium/50 h-10 text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags manager */}
          <div className="relative z-10 pt-2 border-t border-white/10">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-1.5 mb-3">
              <Hash className="w-4 h-4 text-brand-medium" /> Topics & Tags
            </Label>
            
            <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
              <Input
                placeholder="Add a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="max-w-[300px] h-11 bg-black/30 border-white/10 rounded-xl focus-visible:ring-brand-medium/50 text-sm transition-all"
              />
              <Button type="submit" variant="secondary" className="h-11 rounded-xl px-5 font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors">
                Add Tag
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 bg-brand-medium/15 text-brand-medium border border-brand-medium/30 text-xs sm:text-sm px-3.5 py-1.5 rounded-full font-semibold shadow-sm animate-in zoom-in duration-300">
                  #{tag}
                  <button type="button" className="text-brand-medium/60 hover:text-brand-medium hover:bg-brand-medium/20 rounded-full p-0.5 transition-colors" onClick={() => handleRemoveTag(tag)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-white/30 italic">No tags added yet. Tags help people discover your post.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
