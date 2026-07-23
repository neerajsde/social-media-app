import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';

export default function AboutPage() {
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
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <Logo imageClassName="h-16" />
          <h1 className="text-4xl font-bold">About ReelTube</h1>
          <p className="text-muted-foreground text-center max-w-xl">
            A premium next-generation ReelTube platform built for real-time engagement, collaborative posting, and media discovery.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At ReelTube, our mission is to empower creators and connect communities through immersive, high-quality video and media content. We believe in providing a seamless, fast, and visually stunning platform where anyone can share their stories with the world.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">What Makes Us Different</h2>
            <p className="text-muted-foreground leading-relaxed">
              Built with cutting-edge technology, ReelTube offers a lightning-fast experience with premium features like collaborative posting, real-time messaging, instant notifications, and a highly personalized discovery feed. We prioritize user experience, performance, and modern design aesthetics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Join the Community</h2>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a creator looking to grow your audience or a viewer discovering new content, ReelTube is the place for you. Join thousands of users who are already part of the next generation of ReelTube.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
