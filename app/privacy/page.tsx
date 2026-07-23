import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when you create or modify your account, post content, interact with other users, or communicate with us. This may include your name, email address, profile picture, and any other information you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, to personalize your experience, to communicate with you, and to monitor and analyze trends and usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not share your personal information with third parties except as described in this privacy policy, such as with your consent, to comply with laws, to protect our rights, or in connection with a business transfer. Public content you post on ReelTube is visible to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Changes to this Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. If we make material changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
