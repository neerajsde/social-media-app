import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  return {
    title: '@' + username,
    description: 'Check out @' + username + 's posts, reels, and media on ReelTube.',
    keywords: username + ', profile, ReelTube creator, posts, videos',
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
