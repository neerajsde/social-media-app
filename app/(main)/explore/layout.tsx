import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover trending posts, popular hashtags, and top creators on ReelTube.',
  keywords: 'explore, trending, viral, hashtags, creators, ReelTube',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
