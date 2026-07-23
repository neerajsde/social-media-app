import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ReelTube, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              When creating an account, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Content Guidelines</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users may post, upload, and share content. You retain ownership of your content, but grant ReelTube a worldwide, non-exclusive license to use, distribute, and display it on our platform. You agree not to post content that is illegal, abusive, harassing, or violates any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The ReelTube platform, including its original content, features, and functionality, are owned by ReelTube and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
