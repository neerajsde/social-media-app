import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for ReelTube explaining how we use cookies and tracking technologies.',
  keywords: 'cookies, tracking, policy, ReelTube',
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
