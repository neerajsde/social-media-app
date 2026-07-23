import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookiesPage() {
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
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. What are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience on ReelTube, understand how our platform is being used, remember your preferences (such as dark mode), and keep you logged in to your account securely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Types of Cookies We Use</h2>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the platform to function properly (e.g., authentication).</li>
              <li><strong>Functional Cookies:</strong> Help remember your settings and preferences.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Most web browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
