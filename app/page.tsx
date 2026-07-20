'use client';
import { useGetProfileQuery } from '../lib/features/auth/authApi';
import Link from 'next/link';

export default function Home() {
  const { data: user, isLoading } = useGetProfileQuery();

  return (
    <main className="flex-1 bg-gradient-to-br from-[#0F2A1D] to-[#375534] text-[#E3EED4]">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-[#6B9071]/30">
        <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#AEC3B0] to-[#E3EED4]">
          NexusPlay
        </div>
        <div>
          {isLoading ? (
            <div className="w-8 h-8 rounded-full border-2 border-[#6B9071] border-t-transparent animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-[#AEC3B0] font-medium">Welcome, {user.name}</span>
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                alt="Avatar"
                className="w-10 h-10 rounded-full ring-2 ring-[#6B9071]"
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-[#375534] hover:bg-[#6B9071]/40 border border-[#6B9071]/30 transition-all font-semibold backdrop-blur-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 py-32 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#6B9071]/25 blur-[120px] rounded-full pointer-events-none" />

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 z-10 leading-tight">
          Next-Gen Social <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B9071] via-[#AEC3B0] to-[#E3EED4]">
            Media Platform
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#AEC3B0] max-w-2xl mb-12 z-10">
          Experience real-time chat, seamless HLS video streaming, and rich
          community interactions powered by our cutting-edge domain-driven
          architecture.
        </p>

        <div className="flex flex-wrap gap-4 z-10 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#375534] to-[#6B9071] font-bold hover:shadow-[0_0_40px_-10px_rgba(107,144,113,0.6)] transition-all hover:-translate-y-1 border border-[#6B9071]/40"
          >
            Enter Dashboard
          </Link>
          <a
            href="https://backend.neerajprajapati.in/docs/"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-full border border-[#6B9071]/30 bg-[#0F2A1D]/60 hover:bg-[#375534]/60 backdrop-blur-sm font-bold transition-all"
          >
            View API Docs
          </a>
        </div>
      </section>

      {/* Domain Features Grid */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'User & Auth', icon: '👤', desc: 'Secure authentication flows with domain-driven modular boundaries.' },
            { title: 'Posts & Reels', icon: '🎬', desc: 'HLS (m3u8) streaming from CDN directly in your feed.' },
            { title: 'Real-time Chat', icon: '💬', desc: 'Powered by Socket.io, enabling instantaneous collaboration.' },
            { title: 'Marketplace', icon: '🛍️', desc: 'Buy and sell seamlessly using our native platform integration.' },
            { title: 'Advanced Search', icon: '🔍', desc: 'Lightning-fast lookup for users, tags, and rich content.' },
            { title: 'Redux State', icon: '⚛️', desc: 'Utilizing RTK Query for efficient and deduped data fetching.' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-[#375534]/30 border border-[#6B9071]/15 hover:bg-[#375534]/50 transition-colors group cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#E3EED4]">{feature.title}</h3>
              <p className="text-[#AEC3B0] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
