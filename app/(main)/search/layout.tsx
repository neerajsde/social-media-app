import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for posts, people, and hashtags on ReelTube.',
  keywords: 'search, find, people, hashtags, posts, ReelTube',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
