import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your ReelTube account to connect with the community.',
  keywords: 'login, sign in, ReelTube',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
