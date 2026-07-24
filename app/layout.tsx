import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import StoreProvider from "./StoreProvider";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ReelTube",
    default: "ReelTube - Connect, Share, and Discover",
  },
  description: "A premium next-generation ReelTube platform for real-time engagement, collaborative posting, and media discovery.",
  openGraph: {
    type: "website",
    siteName: "ReelTube",
    title: "ReelTube - Connect, Share, and Discover",
    description: "A premium next-generation ReelTube platform for real-time engagement, collaborative posting, and media discovery.",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "ReelTube Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ReelTube - Connect, Share, and Discover",
    description: "A premium next-generation ReelTube platform for real-time engagement.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
