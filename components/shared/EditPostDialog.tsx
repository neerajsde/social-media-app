'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePostMutation } from '@/lib/features/post/postApi';
import type { Post } from '@/lib/types';

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const [content, setContent] = useState(post.content || '');
  const [visibility, setVisibility] = useState(post.visibility || 'public');
  const [status, setStatus] = useState(post.status || 'active');

  const [updatePost, { isLoading }] = useUpdatePostMutation();

  useEffect(() => {
    if (open) {
      setContent(post.content || '');
      setVisibility(post.visibility || 'public');
      setStatus(post.status || 'active');
    }
  }, [open, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length > 5000) {
      toast.error('Post content exceeds maximum 5000 characters limit');
      return;
    }

    try {
      await updatePost({
        postId: post.id,
        content,
        visibility,
        status,
      }).unwrap();
      
      toast.success('Post updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update post');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-card border-border backdrop-blur-2xl text-foreground rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Edit Post</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Make changes to your post. Note that media cannot be changed after posting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-semibold text-foreground/80">Content</Label>
              <span className="text-xs text-muted-foreground font-mono">{content.length}/5000</span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] bg-background border-border/50 focus-visible:ring-brand-medium/50 resize-y p-4 text-sm font-mono placeholder:text-muted-foreground/50 rounded-xl transition-all shadow-inner"
              placeholder="What's on your mind? Markdown supported..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground/80">Visibility</Label>
              <Select value={visibility} onValueChange={(val) => val && setVisibility(val as any)}>
                <SelectTrigger className="bg-background border-border/50 rounded-xl h-11 focus:ring-brand-medium/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="public">🌍 Public</SelectItem>
                  <SelectItem value="followers">👥 Followers</SelectItem>
                  <SelectItem value="private">🔒 Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground/80">Status</Label>
              <Select value={status} onValueChange={(val) => val && setStatus(val as any)}>
                <SelectTrigger className="bg-background border-border/50 rounded-xl h-11 focus:ring-brand-medium/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="active">✅ Active</SelectItem>
                  <SelectItem value="archived">📦 Archived</SelectItem>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto rounded-full px-6 font-semibold hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto rounded-full px-8 bg-brand-medium hover:bg-brand-dark text-black font-bold transition-colors shadow-lg"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
