import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JitsDiary",
  description: "Your jiu-jitsu training diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>
          <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">JitsDiary</Link>
              <Link href="/sessions" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Sessions</Link>
              <Link href="/profile" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Profile</Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SignedOut>
                <SignInButton mode="modal" />
                <SignUpButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
