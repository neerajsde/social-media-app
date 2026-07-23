import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about ReelTube, our mission, and our premium ReelTube platform.',
  keywords: 'about, mission, platform, ReelTube, ReelTube',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
