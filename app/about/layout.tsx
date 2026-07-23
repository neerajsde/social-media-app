import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about ReelTube, our mission, and our premium social media platform.',
  keywords: 'about, mission, platform, ReelTube, social media',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
