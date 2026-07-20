import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "./StoreProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusPlay - Connect, Share, and Discover",
  description: "A premium next-generation social media platform for real-time engagement, collaborative posting, and media discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
