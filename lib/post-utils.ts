import type { Post } from './types';

/** Normalize backend feed/post JSON into the frontend Post shape. */
export function normalizeFeedPost(raw: Record<string, unknown>): Post {
  const author = (raw.author ?? raw.user) as Post['author'];
  const video = raw.video as Post['video'];
  const hashtags = raw.hashtags as string[] | undefined;

  return {
    id: raw.id as string,
    postType: raw.postType as Post['postType'],
    content: raw.content as string | undefined,
    visibility: (raw.visibility as Post['visibility']) ?? 'public',
    status: (raw.status as Post['status']) ?? 'active',
    images: raw.images as string[] | undefined,
    mediaUrl: raw.mediaUrl as string | undefined,
    thumbnailUrl: (raw.thumbnailUrl as string | undefined) ?? video?.thumbnail,
    musicName: (raw.reel as { musicName?: string } | undefined)?.musicName,
    musicUrl: (raw.reel as { musicUrl?: string } | undefined)?.musicUrl,
    likesCount: Number(raw.likesCount ?? raw.likeCount ?? 0),
    commentsCount: Number(raw.commentsCount ?? raw.commentCount ?? 0),
    sharesCount: Number(raw.sharesCount ?? raw.shareCount ?? 0),
    viewsCount: Number(raw.viewsCount ?? raw.viewCount ?? 0),
    isLiked: Boolean(raw.isLiked),
    isBookmarked: Boolean(raw.isBookmarked),
    isOwnPost: Boolean(raw.isOwnPost),
    isFollowingAuthor: Boolean(raw.isFollowingAuthor),
    createdAt: raw.createdAt as string,
    author,
    user: author,
    tags: (raw.tags as string[] | undefined) ?? hashtags,
    video,
    parentPost: raw.parentPost
      ? normalizeFeedPost(raw.parentPost as Record<string, unknown>)
      : undefined,
  };
}
