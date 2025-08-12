import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Golf Buddy Matcher - Find Your Perfect Golf Partner",
  description: "Connect with compatible golfers in your area. Swipe, match, and play together with Golf Buddy Matcher - the Tinder for golf!",
  keywords: "golf, matching, golf partners, golf buddies, golf social, golf app",
  authors: [{ name: "Golf Buddy Matcher Team" }],
  openGraph: {
    title: "Golf Buddy Matcher - Find Your Perfect Golf Partner",
    description: "Connect with compatible golfers in your area. Swipe, match, and play together!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golf Buddy Matcher - Find Your Perfect Golf Partner",
    description: "Connect with compatible golfers in your area. Swipe, match, and play together!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
