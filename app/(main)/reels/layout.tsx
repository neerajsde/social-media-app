import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reels',
  description: 'Watch short-form, engaging, and entertaining reels on ReelTube.',
  keywords: 'reels, short videos, entertainment, viral videos, ReelTube',
};

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
