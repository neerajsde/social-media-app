import type { Post, User, Notification, Conversation, Message } from './types';

// Mock users
export const mockUsers: User[] = [
  { id: '1', username: 'sarah_creates', first_name: 'Sarah', last_name: 'Chen', bio: 'Digital artist and photographer. Capturing moments that matter.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', bannerUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop', isVerified: true, followersCount: 12400, followingCount: 340, postCount: 892 },
  { id: '2', username: 'alex_wanderer', first_name: 'Alex', last_name: 'Morgan', bio: 'Travel photographer exploring the world one frame at a time.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isVerified: false, followersCount: 8200, followingCount: 560, postCount: 456 },
  { id: '3', username: 'maya_codes', first_name: 'Maya', last_name: 'Patel', bio: 'Software engineer by day, musician by night. Building cool things.', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', isVerified: true, followersCount: 23100, followingCount: 189, postCount: 1203 },
  { id: '4', username: 'david_fitness', first_name: 'David', last_name: 'Kim', bio: 'Personal trainer & nutritionist. Transform your life.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', isVerified: false, followersCount: 5600, followingCount: 412, postCount: 334 },
  { id: '5', username: 'emma_designs', first_name: 'Emma', last_name: 'Wilson', bio: 'UI/UX Designer at a tech startup. Design is thinking made visual.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', isVerified: true, followersCount: 18900, followingCount: 267, postCount: 678 },
];

// Mock posts
export const mockPosts: Post[] = [
  {
    id: 'p1', postType: 'image', content: 'Golden hour at the coast. Some moments are worth waiting for.', visibility: 'public', status: 'active',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'],
    likesCount: 842, commentsCount: 56, sharesCount: 23, viewsCount: 4200, isLiked: false, isBookmarked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { id: '1', username: 'sarah_creates', first_name: 'Sarah', last_name: 'Chen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', isVerified: true },
    tags: ['photography', 'goldenhour', 'coastal'],
  },
  {
    id: 'p2', postType: 'text', content: 'Just finished building a real-time collaborative editor using CRDTs. The conflict resolution is elegant - no more operational transforms needed. If you are working on multiplayer features, I highly recommend looking into Yjs or Automerge.\n\nHere is a thread on what I learned along the way.', visibility: 'public', status: 'active',
    likesCount: 1203, commentsCount: 89, sharesCount: 156, viewsCount: 8900,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    author: { id: '3', username: 'maya_codes', first_name: 'Maya', last_name: 'Patel', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', isVerified: true },
    tags: ['programming', 'CRDTs', 'webdev'],
  },
  {
    id: 'p3', postType: 'image', content: 'Morning vibes in Kyoto. The bamboo forest never gets old.', visibility: 'public', status: 'active',
    images: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop',
    ],
    likesCount: 2340, commentsCount: 134, sharesCount: 89, viewsCount: 15600,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    author: { id: '2', username: 'alex_wanderer', first_name: 'Alex', last_name: 'Morgan', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isVerified: false },
    tags: ['travel', 'japan', 'kyoto'],
  },
  {
    id: 'p4', postType: 'text', content: '5 things I wish I knew before starting my fitness journey:\n\n1. Consistency beats intensity every single time\n2. Sleep is just as important as your workout\n3. You can not out-train a bad diet\n4. Rest days are growth days\n5. Progress is not linear - trust the process\n\nSave this for when you need a reminder.', visibility: 'public', status: 'active',
    likesCount: 4521, commentsCount: 312, sharesCount: 890, viewsCount: 32000,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    author: { id: '4', username: 'david_fitness', first_name: 'David', last_name: 'Kim', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', isVerified: false },
    tags: ['fitness', 'health', 'motivation'],
  },
  {
    id: 'p5', postType: 'image', content: 'New design system for our product launch. Clean, scalable, and accessible. What do you think?', visibility: 'public', status: 'active',
    images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'],
    likesCount: 1890, commentsCount: 98, sharesCount: 45, viewsCount: 11200,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    author: { id: '5', username: 'emma_designs', first_name: 'Emma', last_name: 'Wilson', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', isVerified: true },
    tags: ['design', 'ui', 'designsystem'],
  },
  {
    id: 'p6', postType: 'image', content: 'The Northern Lights from Iceland last week. Nature puts on the best shows.', visibility: 'public', status: 'active',
    images: ['https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&h=600&fit=crop'],
    likesCount: 6780, commentsCount: 234, sharesCount: 412, viewsCount: 45000,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: { id: '2', username: 'alex_wanderer', first_name: 'Alex', last_name: 'Morgan', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isVerified: false },
    tags: ['travel', 'iceland', 'northernlights'],
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'like', message: 'liked your post', isRead: false, createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), actor: mockPosts[0].author, postId: 'p1' },
  { id: 'n2', type: 'follow', message: 'started following you', isRead: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), actor: mockPosts[2].author },
  { id: 'n3', type: 'comment', message: 'commented on your post', isRead: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), actor: mockPosts[1].author, postId: 'p2' },
  { id: 'n4', type: 'like', message: 'liked your post', isRead: true, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), actor: mockPosts[3].author, postId: 'p3' },
  { id: 'n5', type: 'mention', message: 'mentioned you in a comment', isRead: true, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), actor: mockPosts[4].author, postId: 'p5' },
];

export const mockConversations: Conversation[] = [
  { id: 'c1', participants: [mockPosts[0].author, mockPosts[1].author], lastMessage: { id: 'm1', content: 'Hey! Love your latest project. Can we collab?', senderId: '3', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false }, unreadCount: 2, updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: 'c2', participants: [mockPosts[0].author, mockPosts[2].author], lastMessage: { id: 'm2', content: 'The photos from the trip turned out amazing!', senderId: '2', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isRead: true }, unreadCount: 0, updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'c3', participants: [mockPosts[0].author, mockPosts[4].author], lastMessage: { id: 'm3', content: 'Sent you the design files', senderId: '5', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), isRead: true }, unreadCount: 0, updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
];

export const trendingTags = [
  { tag: 'photography', postCount: 12400 },
  { tag: 'webdev', postCount: 8900 },
  { tag: 'travel', postCount: 7600 },
  { tag: 'fitness', postCount: 6300 },
  { tag: 'design', postCount: 5100 },
  { tag: 'ai', postCount: 4800 },
  { tag: 'startup', postCount: 3200 },
];

export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
