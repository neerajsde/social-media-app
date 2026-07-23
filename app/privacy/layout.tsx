import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ReelTube explaining how we collect, use, and protect your data.',
  keywords: 'privacy, policy, data, security, ReelTube',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
