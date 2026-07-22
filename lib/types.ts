export interface User {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
  profile?: UserProfile;
  isFollowing?: boolean;
  follower?: number;
  following?: number;
}

export interface UserProfile {
  gender?: string;
  birthdate?: string;
  location?: string;
  websiteUrl?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
}

// ─── Auth Types ──────────────────────────────────────
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  otpToken: string | null;
  otpRequired: boolean;
  isInitialized: boolean;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string; // OTP verification token when 2FA is enabled
  user?: User;
}

export interface RegisterStep1Request {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OtpVerifyRequest {
  otp: string;
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  emailOrUsername: string;
}

export interface ResetPasswordSetRequest {
  password: string;
  confirmPassword: string;
  token: string;
}

// ─── Post Types ──────────────────────────────────────
export type PostType = 'text' | 'image' | 'video' | 'reel';
export type PostVisibility = 'public' | 'private' | 'followers';
export type PostStatus = 'active' | 'archived' | 'draft';

export interface Post {
  id: string;
  postType: PostType;
  content?: string;
  visibility: PostVisibility;
  status: PostStatus;
  images?: string[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  musicName?: string;
  musicUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  isOwner?: boolean;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt?: string;
  author: PostAuthor;
  tags?: string[];
  parentPost?: Post;
  user?: PostAuthor;
  isOwnPost?: boolean;
  isFollowingAuthor?: boolean;
  video?: {
    hlsMasterKey?: string;
    thumbnail?: string;
    durationSec?: number;
    originalVideo?: string;
    status?: string;
  };
}

export interface PostAuthor {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface CreatePostRequest {
  postType: PostType;
  content?: string;
  visibility: PostVisibility;
  status: PostStatus;
  images?: string[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  musicName?: string;
  musicUrl?: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string;
  author: PostAuthor;
  replies?: Comment[];
}

// ─── Feed / Pagination ───────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface FeedResponse {
  success: boolean;
  message?: string;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type FeedType = 'foryou' | 'following' | 'trending';

// ─── Search Types ────────────────────────────────────
export type SearchType = 'foryou' | 'account' | 'trending' | 'tags' | 'posts';

export interface SearchRequest {
  q?: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}

export interface SearchUserResult {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  batch?: string;
}

export interface SearchTagResult {
  id: string;
  tag: string;
  _count: { posts: number };
}

export interface SearchTrendingResult {
  query: string;
  score: number;
}

export interface RecentSearchResult {
  id?: string;
  query: string;
  type?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface SearchPostResult {
  id: string;
  type: PostType;
  content?: string;
  images?: string[];
  mediaUrl?: string;
  thumbnail?: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  tags?: string[];
  author: PostAuthor;
}

// ─── Notification Types ──────────────────────────────
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: PostAuthor;
  postId?: string;
}

// ─── Chat Types ──────────────────────────────────────
export interface Conversation {
  id: string;
  participants: PostAuthor[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}
