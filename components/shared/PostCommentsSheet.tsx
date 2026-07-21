'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGetPostCommentsQuery } from '@/lib/features/post/postApi';
import CommentSection from './CommentSection';

interface PostCommentsSheetProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostCommentsSheet({ postId, open, onOpenChange }: PostCommentsSheetProps) {
  const { data, isLoading, isFetching } = useGetPostCommentsQuery(
    { postId, page: 1, limit: 50 },
    { skip: !open }
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] sm:max-h-[85vh] sm:max-w-[500px] sm:mx-auto sm:border-x sm:border-t rounded-t-2xl px-0 pt-3 pb-0 flex flex-col z-[100]">
        <SheetHeader className="px-4 pb-2 border-b">
          <SheetTitle className="text-center text-sm font-semibold">Comments</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
          <CommentSection
            comments={Array.isArray(data?.data) ? data.data : (data?.data?.comments || [])}
            postId={postId}
            isLoading={isLoading}
            isFetching={isFetching}
            totalComments={data?.data?.pagination?.total || data?.total || 0}
            onLoadMore={() => {}}
            hasMore={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
